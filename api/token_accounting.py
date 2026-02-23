"""
Hardened Token Accounting System for Project Ascension.
Provides atomic balance management, subscription plan enforcement, and transaction logging.
"""
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.usage_db import UserAccount, TokenTransaction, SubscriptionPlan, SessionLocal
from utils.logger import logger

class TokenAccountingSystem:
    """
    Financial governor for the public platform API (Hardened Edition).
    """

    @staticmethod
    def get_user_status(user_id: str) -> Tuple[int, Optional[str], int]:
        """
        Returns (balance, plan_name, access_level)
        """
        with SessionLocal() as db:
            result = db.query(UserAccount.token_balance, SubscriptionPlan.name, SubscriptionPlan.access_level)\
                .outerjoin(SubscriptionPlan, UserAccount.plan_id == SubscriptionPlan.id)\
                .filter(UserAccount.id == user_id).first()
            return result if result else (0, None, 1)

    @staticmethod
    def deduct_tokens(user_id: str, amount: int, reference_id: str) -> bool:
        """
        ATOMIC deduction of tokens. Updates balance and creates a transaction record.
        """
        with SessionLocal() as db:
            try:
                # Select user with for_update to prevent race conditions during balance checks
                user = db.query(UserAccount).filter(UserAccount.id == user_id).with_for_update().first()
                if not user or user.token_balance < amount:
                    return False
                
                user.token_balance -= amount
                
                # Record transaction
                tx = TokenTransaction(
                    user_id=user_id,
                    amount=-amount,
                    transaction_type='DEBIT',
                    reference_id=reference_id
                )
                db.add(tx)
                db.commit()
                logger.info(f"ATOMIC DEBIT: {amount} tokens from {user_id} (Ref: {reference_id})")
                return True
            except Exception as e:
                db.rollback()
                logger.error(f"TOKEN TRANSACTON ERROR: {e}")
                return False

    @staticmethod
    def estimate_cost(objective: str) -> int:
        """
        Calculates projected token cost based on task complexity.
        """
        base_cost = 100
        if "swarm" in objective.lower(): base_cost *= 10
        if "refactor" in objective.lower(): base_cost *= 5
        return base_cost

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
        """
        with SessionLocal() as db:
            try:
                user = db.query(UserAccount).filter(UserAccount.id == user_id).with_for_update().first()
                if not user:
                    return False
                
                user.token_balance += amount
                
                tx = TokenTransaction(
                    user_id=user_id,
                    amount=amount,
                    transaction_type='CREDIT',
                    reference_id=reference_id
                )
                db.add(tx)
                db.commit()
                logger.info(f"ATOMIC CREDIT: {amount} tokens to {user_id} (Ref: {reference_id})")
                return True
            except Exception as e:
                db.rollback()
                logger.error(f"TOKEN TOPUP ERROR: {e}")
                return False
