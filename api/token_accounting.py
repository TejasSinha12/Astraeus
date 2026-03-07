"""
Hardened Token Accounting System for Project Ascension.
Provides atomic balance management, subscription plan enforcement, and transaction logging.
"""
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.usage_db import UserAccount, TokenTransaction, SubscriptionPlan, Organization, SessionLocal
from api.notifications import NotificationService
from utils.logger import logger

class TokenAccountingSystem:
    """
    Financial governor for the public platform API (Hardened Edition).
    """

    @staticmethod
    def get_user_status(user_id: str) -> Tuple[int, Optional[str], int]:
        """
        Returns (balance, plan_name, access_level)
        Resolves to Organization balance if user is in an org.
        """
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            if not user:
                # UX: Auto-provision 100 starter credits for brand new signups
                user = UserAccount(id=user_id, email=f"auth_user_{user_id[:8]}@ascension.ai", role="PUBLIC", plan_id="free_tier", token_balance=100)
                db.add(user)
                db.commit()
                return (100, "PUBLIC", 1)
            
            # 1. Resolve to Organization if member
            if user.org_id:
                org = db.query(Organization).filter(Organization.id == user.org_id).first()
                if org:
                    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == org.plan_id).first()
                    return (org.token_balance, plan.name if plan else "INSTITUTIONAL", plan.access_level if plan else 2)
            
            # 2. Fallback to individual balance
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.id == user.plan_id).first()
            return (user.token_balance, plan.name if plan else "PUBLIC", plan.access_level if plan else 1)

    @staticmethod
    def deduct_tokens(user_id: str, amount: int, reference_id: str) -> bool:
        """
        ATOMIC deduction of tokens. Updates balance (user or org) and creates a transaction record.
        """
        with SessionLocal() as db:
            try:
                # 1. Resolve User
                user = db.query(UserAccount).filter(UserAccount.id == user_id).with_for_update().first()
                if not user:
                    return False
                
                # 2. Determine target for deduction
                target_org = None
                if user.org_id:
                    target_org = db.query(Organization).filter(Organization.id == user.org_id).with_for_update().first()
                
                if target_org:
                    if target_org.token_balance < amount:
                        return False
                    target_org.token_balance -= amount
                    logger.info(f"INSTITUTIONAL DEBIT: {amount} tokens from Org {user.org_id} via User {user_id}")
                    
                    # Low Balance Trigger (Org)
                    if target_org.token_balance < 1000:
                        import asyncio
                        ns = NotificationService()
                        asyncio.create_task(ns.send_low_balance_alert(user.email, target_org.token_balance))
                else:
                    if user.token_balance < amount:
                        return False
                    user.token_balance -= amount
                    logger.info(f"INDIVIDUAL DEBIT: {amount} tokens from {user_id}")

                    # Low Balance Trigger (Individual)
                    if user.token_balance < 1000:
                        import asyncio
                        ns = NotificationService()
                        asyncio.create_task(ns.send_low_balance_alert(user.email, user.token_balance))

                # 3. Record transaction
                tx = TokenTransaction(
                    user_id=user_id,
                    org_id=user.org_id,
                    amount=-amount,
                    transaction_type='DEBIT',
                    reference_id=reference_id
                )
                db.add(tx)
                db.commit()
                return True
            except Exception as e:
                db.rollback()
                logger.error(f"TOKEN TRANSACTON ERROR: {e}")
                return False

    @staticmethod
    def estimate_cost(objective: str) -> int:
        """
        Calculates projected token cost based on task complexity.
        Uses scaling factors for project scope and agent mobilization.
        """
        # Base metabolic cost for a tactical mission
        cost = 50
        
        # Scaling based on objective depth (roughly prompt size)
        cost += len(objective) // 2
        
        # Complexity Multipliers
        obj_lower = objective.lower()
        if any(w in obj_lower for w in ["ecommerce", "dashboard", "fullstack", "authentication"]):
            cost *= 10  # Full system architectural scale
        elif any(w in obj_lower for w in ["database", "api", "integration", "ui"]):
            cost *= 5   # Component level scale
            
        # Swarm Multiplier (Requires multi-agent overhead)
        if "swarm" in obj_lower or "mobile" in obj_lower:
            cost *= 2
            
        return max(cost, 100) # Minimum platform fee

    @staticmethod
    def provision_user(user_id: str, email: str, role: str = "PUBLIC", plan_id: str = "free_tier"):
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            if not user:
                user = UserAccount(id=user_id, email=email, role=role, plan_id=plan_id, token_balance=5000)
                db.add(user)
                db.commit()

    @staticmethod
    def top_up_tokens(user_id: str, amount: int, reference_id: str) -> bool:
        """
        ATOMIC top-up of tokens. Increments balance and records credit transaction.
        Auto-provisions user if they don't exist.
        """
        with SessionLocal() as db:
            try:
                user = db.query(UserAccount).filter(UserAccount.id == user_id).with_for_update().first()
                if not user:
                    # Auto-provision if missing
                    user = UserAccount(
                        id=user_id, 
                        email=f"provisioned_{user_id[:8]}@ascension.ai", 
                        role="PUBLIC", 
                        plan_id="free_tier", 
                        token_balance=0
                    )
                    db.add(user)
                    db.flush() # Ensure ID is registered for the transaction join
                
                user.token_balance += amount
                
                tx = TokenTransaction(
                    user_id=user_id,
                    amount=amount,
                    transaction_type='CREDIT',
                    reference_id=reference_id
                )
                db.add(tx)
                db.commit()
                logger.info(f"ATOMIC CREDIT (Auto-Prov): {amount} tokens to {user_id} (Ref: {reference_id})")
                return True
            except Exception as e:
                db.rollback()
                logger.error(f"TOKEN TOPUP ERROR: {e}")
                return False
