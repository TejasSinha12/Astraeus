"""
Swarm Cluster Manager for Project Ascension.
Handles the lifecycle and regional governance of independent Swarm Instances.
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel
import uuid

from core.swarm_orchestrator import SwarmOrchestrator
from core.governance_manager import GovernanceManager, GovernanceConfig, OperationalMode
from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class ClusterState(BaseModel):
    id: str
    name: str
    region: str
    mode: OperationalMode
    active_missions: int = 0

class SwarmInstance:
    """
    A standalone swarm unit operating within the larger federation.
    Each instance has its own orchestrator and local governance constraints.
    """

    def __init__(self, cluster_id: str, name: str, region: str, reasoning: ReasoningEngine, governance_config: Optional[GovernanceConfig] = None):
        self.id = cluster_id
        self.name = name
        self.region = region
        self.reasoning = reasoning
        
        # Isolated Orchestrator and Governance
        self.orchestrator = SwarmOrchestrator(reasoning)
        self.governance = GovernanceManager(governance_config)
        
        logger.info(f"CLUSTER [{self.id}]: Instance '{self.name}' online in {self.region}.")

    async def execute_task(self, objective: str) -> Dict[str, Any]:
        """
        Executes a task within this specific cluster's context.
        """
        logger.info(f"CLUSTER [{self.id}]: Executing mission: {objective[:30]}...")
        
        # Attach cluster context to the objective
        contextual_objective = f"[Cluster Context: {self.name}/{self.region}] {objective}"
        
        result = await self.orchestrator.execute_swarm_objective(contextual_objective)
        
        # Tag the result with this cluster_id for partitioning
        result["cluster_id"] = self.id
        return result

    def get_state(self) -> ClusterState:
        return ClusterState(
            id=self.id,
            name=self.name,
            region=self.region,
            mode=self.governance.config.mode
        )
