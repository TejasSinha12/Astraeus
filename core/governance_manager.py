"""
Governance Manager for Project Ascension Swarm.
Enforces operational modes and safety guardrails for autonomous actions.
"""
from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel
from utils.logger import logger

class OperationalMode(Enum):
    OBSERVE = "observe"       # Log only, no code changes
    SIMULATED = "simulated"   # Changes in isolated branches, metrics diff only
    COMMIT = "commit"         # Gated integration after statistical validation

class GovernanceConfig(BaseModel):
    mode: OperationalMode = OperationalMode.OBSERVE
    min_fitness_improvement: float = 0.05
    max_risk_score: float = 0.3
    require_human_approval: bool = True

class GovernanceManager:
    """
    Registry for operational safety rules and mode enforcement.
    """

    def __init__(self, config: Optional[GovernanceConfig] = None):
        self.config = config or GovernanceConfig()
        logger.info(f"GovernanceManager active in {self.config.mode.value.upper()} mode.")

    def authorize_action(self, action_type: str, risk_score: float) -> bool:
        """
        Determines if an action (e.g., REFACTOR, COMMIT) is permitted under current mode.
        """
        if self.config.mode == OperationalMode.OBSERVE:
            logger.warning(f"ACTION BLOCKED: Mode is OBSERVE. (Action: {action_type})")
            return False
            
        if risk_score > self.config.max_risk_score:
            logger.error(f"ACTION BLOCKED: Risk score {risk_score} exceeds threshold {self.config.max_risk_score}")
            return False
            
        logger.info(f"ACTION AUTHORIZED: {action_type} (Risk: {risk_score})")
        return True

    def set_mode(self, mode: OperationalMode):
        logger.info(f"Governance mode transition: {self.config.mode.value} -> {mode.value}")
        self.config.mode = mode
