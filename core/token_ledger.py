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
from api.usage_db import UserBalance, TokenLedger, SessionLocal
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

    def _get_previous_hash(self, db: Session, user_id: str) -> str:
        """
        Retrieves the signature of the last transaction for a user to maintain the chain.
        """
        last_tx = db.query(TokenLedger).filter(TokenLedger.user_id == user_id).order_by(TokenLedger.id.desc()).first()
        return last_tx.signature if last_tx else "GENESIS"

    async def process_transaction(self, user_id: str, amount: float, tx_type: str, reason: str) -> bool:
        """
        Atomic transaction: Updates balance and records signed ledger entry.
        """
        try:
            with SessionLocal() as db:
                # 1. Update User Balance
                user_balance = db.query(UserBalance).filter(UserBalance.user_id == user_id).first()
                if not user_balance:
                    user_balance = UserBalance(user_id=user_id, credit_balance=100.0) # Default signup bonus
                    db.add(user_balance)
                
                # Check for sufficient funds if debit
                if tx_type == "DEBIT" and user_balance.credit_balance < abs(amount):
                    logger.warning(f"ECONOMY: Insufficient funds for User {user_id}.")
                    return False

                user_balance.credit_balance += amount
                
                # 2. Record in Ledger
                prev_hash = self._get_previous_hash(db, user_id)
                ts = time.time()
                signature = self._generate_signature(user_id, amount, ts, prev_hash)
                
                ledger_entry = TokenLedger(
                    user_id=user_id,
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
        Retrieves the current credit balance for a user.
        """
        with SessionLocal() as db:
            balance = db.query(UserBalance).filter(UserBalance.user_id == user_id).first()
            return balance.credit_balance if balance else 0.0
