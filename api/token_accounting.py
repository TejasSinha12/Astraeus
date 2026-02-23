"""
Token Accounting System for Ascension Platform.
Handles verification of balances and deduction of request costs.
"""
from typing import Optional
from sqlalchemy.orm import Session
from api.usage_db import UserAccount, APIUsageLog, SessionLocal
from utils.logger import logger

class TokenAccountingSystem:
    """
    Financial governor for the public platform API.
    """

    @staticmethod
    def get_user_balance(user_id: str) -> int:
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            return user.token_balance if user else 0

    @staticmethod
    def deduct_tokens(user_id: str, amount: int, endpoint: str) -> bool:
        """
        Deducts tokens from user balance and logs the transaction.
        Returns False if insufficient funds.
        """
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            if not user or user.token_balance < amount:
                logger.warning(f"INSUFFICIENT FUNDS: User {user_id} lacks {amount} tokens.")
                return False
            
            user.token_balance -= amount
            
            # Log usage
            log = APIUsageLog(
                user_id=user_id,
                endpoint=endpoint,
                tokens_deducted=amount,
                status_code=200
            )
            db.add(log)
            db.commit()
            
            logger.info(f"TOKEN DEDUCTION: {amount} tokens from {user_id} for {endpoint}")
            return True

    @staticmethod
    def provision_user(user_id: str, email: str, role: str = "PUBLIC"):
        """
        Ensures a user exists in the local accounting DB.
        """
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            if not user:
                user = UserAccount(id=user_id, email=email, role=role)
                db.add(user)
                db.commit()
                logger.info(f"PROVISIONED NEW USER: {user_id} ({role})")
