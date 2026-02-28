"""
Abuse Detector for the Ascension Intelligence Economy.
Protects the platform from token anomalies, burst spikes, and malicious consumption.
"""
from typing import Dict, List, Any
import time
from utils.logger import logger

class AbuseDetector:
    """
    Electronic sentry for economic integrity.
    Triggers automated suspensions on suspicious behavior.
    """

    def __init__(self):
        self.usage_history: Dict[str, List[float]] = {} # user_id -> [timestamps]
        self.BURST_THRESHOLD = 10 # missions per minute
        self.ANOMALY_THRESHOLD = 500.0 # tokens per hour

    def check_for_abuse(self, user_id: str, current_token_cost: float) -> bool:
        """
        Analyzes recent activity for burst or anomaly indicators.
        Returns True if safe, False if abuse detected.
        """
        now = time.time()
        
        # 1. Initialize history
        if user_id not in self.usage_history:
            self.usage_history[user_id] = []
            
        # 2. Cleanup old history (older than 1 hour)
        self.usage_history[user_id] = [ts for ts in self.usage_history[user_id] if now - ts < 3600]
        
        # 3. Burst Protection Check (sliding window - 1 minute)
        recent_minute = [ts for ts in self.usage_history[user_id] if now - ts < 60]
        if len(recent_minute) >= self.BURST_THRESHOLD:
            logger.error(f"ABUSE: Burst limit exceeded for User {user_id}!")
            return False
            
        # 4. Token Anomaly Check (total tokens in last hour)
        # Mock: Assuming each timestamp in history represents a mission execution.
        # In production, this would track actual token amounts.
        if len(self.usage_history[user_id]) * 100 > self.ANOMALY_THRESHOLD:
            logger.warning(f"ABUSE: Potential token anomaly for User {user_id}.")
            # Note: We might only warn here or flag for moderation
            
        # Record this mission
        self.usage_history[user_id].append(now)
        return True

    def block_user(self, user_id: str):
        """
        Emergency trigger to suspend a user's API access.
        """
        logger.error(f"ABUSE: EMERGENCY SUSPENSION TRIGGERED FOR {user_id}.")
        # In a real system, this would update 'is_active' in the database.
