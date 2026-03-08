"""
Token Ledger Service for the Ascension Intelligence Economy.
Handles cryptographically signed execution credits and reputation transactions.
"""
import hmac
import hashlib
import json
import time
from typing import Optional
from sqlalchemy.orm import Session
from api.usage_db import TokenLedger, Organization, UserAccount, SessionLocal
from utils.logger import logger

class TokenLedgerService:
    """
    Production-grade ledger for tracking intelligence economy transactions.
    Ensures integrity via HMAC-SHA256 chaining.
    """

    def __init__(self, secret_key: str = "ascension_economy_secret"):
        self.secret_key = secret_key

    def _generate_signature(self, user_id: str, amount: float, timestamp: float, prev_hash: str) -> str:
        """
        Creates a cryptographic signature for a ledger record.
        """
        message = f"{user_id}:{amount}:{timestamp}:{prev_hash}"
        return hmac.new(
            self.secret_key.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

    def _get_previous_hash(self, db: Session, user_id: str, org_id: Optional[str] = None) -> str:
        """
        Retrieves the signature of the last transaction (user or org) to maintain the chain.
        """
        query = db.query(TokenLedger)
        if org_id:
            query = query.filter(TokenLedger.org_id == org_id)
        else:
            query = query.filter(TokenLedger.user_id == user_id)
            
        last_tx = query.order_by(TokenLedger.id.desc()).first()
        return last_tx.signature if last_tx else "GENESIS"

    async def process_transaction(self, user_id: str, amount: float, tx_type: str, reason: str) -> bool:
        """
        Atomic transaction: Updates balance (Org or User) and records signed ledger entry.
        """
        try:
            with SessionLocal() as db:
                # 1. Resolve Org Affinity
                user_info = db.query(UserAccount).filter(UserAccount.id == user_id).first()
                org_id = user_info.org_id if user_info else None
                
                # 2. Determine target for balance update
                target_entity = None
                if org_id:
                    target_entity = db.query(Organization).filter(Organization.id == org_id).with_for_update().first()
                
                if target_entity:
                    # Institutional Path
                    if tx_type == "DEBIT" and target_entity.token_balance < abs(amount):
                        logger.warning(f"ECONOMY: Insufficient institutional funds for Org {org_id} (via {user_id}).")
                        return False
                    target_entity.token_balance += amount
                else:
                    # Individual Path using unified UserAccount pool
                    user = db.query(UserAccount).filter(UserAccount.id == user_id).with_for_update().first()
                    if not user:
                        # Auto-provision if missing
                        user = UserAccount(id=user_id, email=f"user_{user_id[:8]}@ascension.ai", role="PUBLIC", token_balance=1000)
                        db.add(user)
                        db.flush()
                    
                    if tx_type == "DEBIT" and user.token_balance < abs(amount):
                        logger.warning(f"ECONOMY: Insufficient individual funds for User {user_id}.")
                        return False
                    user.token_balance += amount
                
                # 3. Record in Ledger
                prev_hash = self._get_previous_hash(db, user_id, org_id)
                ts = time.time()
                # Sign based on the primary entity (Org or User)
                signer_id = org_id if org_id else user_id
                signature = self._generate_signature(signer_id, amount, ts, prev_hash)
                
                ledger_entry = TokenLedger(
                    user_id=user_id,
                    org_id=org_id,
                    transaction_type=tx_type,
                    amount=amount,
                    reason=reason,
                    previous_hash=prev_hash,
                    signature=signature
                )
                db.add(ledger_entry)
                db.commit()
                
                logger.info(f"ECONOMY: {tx_type} of {amount} for {user_id} - SIGNED.")
                return True
        except Exception as e:
            logger.error(f"ECONOMY: Transaction failed: {e}")
            return False

    async def get_balance(self, user_id: str) -> float:
        """
        Retrieves the current credit balance for a user from the unified pool.
        """
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            return user.token_balance if user else 0.0
