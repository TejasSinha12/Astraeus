"""
Reputation Tracker for the Ascension Intelligence Economy.
Earns non-transferable 'Reputation Tokens' based on mission success and structural innovations.
"""
from typing import Optional
from sqlalchemy.orm import Session
from api.usage_db import UserAccount, SessionLocal
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
                user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
                if not user:
                    # Auto-provision if missing
                    user = UserAccount(id=user_id, email=f"user_{user_id[:8]}@astraeus.ai", token_balance=1000, reputation_score=1.0)
                    db.add(user)
                
                user.reputation_score += gain
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
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            score = user.reputation_score if user else 1.0
            
            import math
            return 1.0 + math.log10(max(1.0, score))
