"""
Reliability Tracker for individual agents in the swarm.
Tracks success rates, regression counts, and disagreement frequencies.
"""
from typing import Dict, Any, List
import time
from pydantic import BaseModel
from utils.logger import logger

class AgentStats(BaseModel):
    success_count: int = 0
    failure_count: int = 0
    regression_count: int = 0
    disagreement_count: int = 0
    avg_confidence: float = 0.0

class ReliabilityTracker:
    """
    Monitors agent performance over longitudinal evolution cycles.
    """

    def __init__(self):
        self.stats: Dict[str, AgentStats] = {}
        logger.info("ReliabilityTracker online.")

    def record_outcome(self, agent_id: str, success: bool, confidence: float, is_regression: bool = False):
        if agent_id not in self.stats:
            self.stats[agent_id] = AgentStats()
            
        stat = self.stats[agent_id]
        if success:
            stat.success_count += 1
        else:
            stat.failure_count += 1
            
        if is_regression:
            stat.regression_count += 1
            
        # Update running confidence average
        total = stat.success_count + stat.failure_count
        stat.avg_confidence = ((stat.avg_confidence * (total - 1)) + confidence) / total
        
        logger.debug(f"Agent {agent_id} Reliability Updated: SuccessRate={stat.success_count/total:.2f}")

    def get_leaderboard(self) -> Dict[str, float]:
        leaderboard = {}
        for agent_id, stat in self.stats.items():
            total = stat.success_count + stat.failure_count
            if total > 0:
                leaderboard[agent_id] = stat.success_count / total
        return leaderboard
