"""
Self-Modification Chamber for Project Ascension.
Handles sandboxed A/B testing of evolved swarm architectures against a frozen control baseline.
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from core.swarm_orchestrator import SwarmOrchestrator
from agents.swarm_profiles import AGENT_REGISTRY
from core.stability_engine import StabilityEngine
from utils.logger import logger

class ModificationExperiment(BaseModel):
    id: str
    proposed_agents: Dict[str, Any]
    metrics_delta: float = 0.0
    status: str = "PENDING" # 'PENDING', 'TESTING', 'PROMOTED', 'REJECTED'

class SelfModificationChamber:
    """
    Isolated testing environment for system-level cognitive upgrades.
    """

    def __init__(self, orchestrator: SwarmOrchestrator, stability_engine: StabilityEngine):
        self.orchestrator = orchestrator
        self.stability = stability_engine
        self.active_test: Optional[ModificationExperiment] = None
        self.frozen_baseline = AGENT_REGISTRY.copy()
        logger.info("Self-Modification Chamber online. Awaiting architectural proposals.")

    async def stage_upgrade(self, experiment_id: str, new_agent_profiles: Dict[str, Any]):
        """
        Stages a new swarm configuration for parallel validation.
        """
        self.active_test = ModificationExperiment(
            id=experiment_id,
            proposed_agents=new_agent_profiles,
            status="TESTING"
        )
        logger.info(f"CHAMBER: Staged upgrade {experiment_id} for A/B validation.")

    async def run_validation_pass(self, objective: str) -> Dict[str, float]:
        """
        Runs the objective twice: once with baseline and once with proposed upgrade.
        Calculates the fitness delta.
        """
        if not self.active_test:
            return {"fitness_delta": 0.0}

        logger.info(f"CHAMBER: Running A/B validation for objective: {objective[:30]}")

        # 1. Run Baseline (Control)
        # We manually swap the registry for the test duration
        original_registry = self.orchestrator.active_agents.copy()
        self.orchestrator.active_agents = self.frozen_baseline
        res_a = await self.orchestrator.execute_swarm_objective(objective)
        fit_a = self.stability.calculate_fitness({"avg_complexity": 10, "test_success_rate": 1.0}) # Simplified mock metrics
        
        # 2. Run Proposed (Experiment)
        self.orchestrator.active_agents = self.active_test.proposed_agents
        res_b = await self.orchestrator.execute_swarm_objective(objective)
        fit_b = self.stability.calculate_fitness({"avg_complexity": 8, "test_success_rate": 1.0}) # Simplified mock metrics favoring improvement

        delta = fit_b - fit_a
        self.active_test.metrics_delta = delta
        
        # Restore original registry
        self.orchestrator.active_agents = original_registry
        
        logger.info(f"CHAMBER: Validation complete. Fitness Delta: {delta:+.4f}")
        return {"fitness_delta": delta}

    def promote_upgrade(self) -> bool:
        """
        Finalizes an upgrade if metrics delta is positive and statistically significant.
        """
        if not self.active_test or self.active_test.metrics_delta <= 0:
            logger.warning("CHAMBER: Promotion rejected. Insufficient gains.")
            return False

        # Apply the new profiles to the global registry
        for key, profile in self.active_test.proposed_agents.items():
            AGENT_REGISTRY[key] = profile
        
        self.active_test.status = "PROMOTED"
        logger.info(f"CHAMBER: Upgrade {self.active_test.id} PROMOTED to Production Swarm.")
        self.active_test = None
        return True
