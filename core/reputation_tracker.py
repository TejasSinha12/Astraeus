"""
Reputation Tracker for the Ascension Intelligence Economy.
Earns non-transferable 'Reputation Tokens' based on mission success and structural innovations.
"""
from typing import Optional
from sqlalchemy.orm import Session
from api.usage_db import UserBalance, SessionLocal
from core.token_ledger import TokenLedgerService
from utils.logger import logger

class ReputationTracker:
    """
    Manages non-transferable governance weight for users.
    Reputation is earned through proven performance and stability contributions.
    """

    def __init__(self, ledger: TokenLedgerService):
        self.ledger = ledger

    async def reward_success(self, user_id: str, mission_fitness: float):
        """
        Grants reputation based on the fitness of the generated mission.
        """
        if mission_fitness < 0.5:
            logger.info(f"ECONOMY: No reputation gain for User {user_id} (Fitness: {mission_fitness:.2f}).")
            return

        gain = (mission_fitness - 0.5) * 10.0 # Scaling Factor
        
        try:
            with SessionLocal() as db:
                user_balance = db.query(UserBalance).filter(UserBalance.user_id == user_id).first()
                if not user_balance:
                    user_balance = UserBalance(user_id=user_id)
                    db.add(user_balance)
                
                user_balance.reputation_score += gain
                db.commit()
                
                # Log in signed ledger
                await self.ledger.process_transaction(
                    user_id=user_id,
                    amount=gain,
                    tx_type="REPUTATION_GAIN",
                    reason=f"High-fitness mission outcome: {mission_fitness:.4f}"
                )
                
                logger.info(f"ECONOMY: User {user_id} earned {gain:.2f} reputation.")
        except Exception as e:
            logger.error(f"ECONOMY: Reputation reward failed: {e}")

    async def calculate_voting_weight(self, user_id: str) -> float:
        """
        Determines the user's influence in the federation's consensus engine.
        Weight is logarithmic to prevent reputation monopolization.
        """
        with SessionLocal() as db:
            user_balance = db.query(UserBalance).filter(UserBalance.user_id == user_id).first()
            score = user_balance.reputation_score if user_balance else 1.0
            
            import math
            return 1.0 + math.log10(max(1.0, score))
