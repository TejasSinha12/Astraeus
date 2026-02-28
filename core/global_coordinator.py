"""
Global Coordinator for the Ascension Intelligence Federation.
Routes missions across specialized swarm clusters based on expertise and performance.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import random

from api.usage_db import SessionLocal, SwarmCluster
from core.swarm_cluster import SwarmInstance
from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class RoutingVerdict(BaseModel):
    selected_cluster_id: str
    confidence: float
    reasoning: str

class GlobalCoordinator:
    """
    The 'Brain of Brains'. 
    Orchestrates the distribution of high-level objectives to the most capable swarm instance.
    """

    def __init__(self, reasoning: ReasoningEngine):
        self.reasoning = reasoning
        self.clusters: Dict[str, SwarmInstance] = {}
        logger.info("GlobalCoordinator online. Syncing with Federation Registry...")

    async def discover_and_boot_clusters(self):
        """
        Loads all active clusters from the database and initializes their local instances.
        """
        try:
            with SessionLocal() as db:
                clusters = db.query(SwarmCluster).filter(SwarmCluster.is_active == True).all()
                for c in clusters:
                    self.clusters[c.id] = SwarmInstance(
                        cluster_id=c.id,
                        name=c.name,
                        region=c.region,
                        reasoning=self.reasoning
                    )
            logger.info(f"COORDINATOR: Booted {len(self.clusters)} federated swarm clusters.")
        except Exception as e:
            logger.error(f"COORDINATOR: Cluster discovery failed: {e}")

    async def route_mission(self, objective: str) -> RoutingVerdict:
        """
        Analyzes the objective and selects the optimal cluster via reasoning-based routing.
        """
        if not self.clusters:
            # Emergency fallback: Assign to a default ID if no clusters are yet persisted
            return RoutingVerdict(selected_cluster_id="default-swarm", confidence=0.5, reasoning="No clusters discovered; routing to fallback.")

        cluster_map = {cid: {"name": c.name, "region": c.region} for cid, c in self.clusters.items()}
        
        prompt = (
            f"Objective: {objective}\n"
            f"Available Swarm Clusters: {cluster_map}\n\n"
            "Analyze which cluster is best suited for this mission. Consider region and name indicators. "
            "Return a JSON object with: 'selected_cluster_id', 'confidence', 'reasoning'."
        )

        response = await self.reasoning.generate_response(
            system_prompt="You are the Global Coordinator. You route AGI missions to specialized regional clusters.",
            user_prompt=prompt,
            temperature=0.2
        )

        try:
            import json
            data = json.loads(response)
            return RoutingVerdict(**data)
        except:
            # Fallback to random cluster
            cid = random.choice(list(self.clusters.keys()))
            return RoutingVerdict(selected_cluster_id=cid, confidence=0.4, reasoning="Routing fallback reached.")

    async def execute_coordinated_mission(self, objective: str) -> Dict[str, Any]:
        """
        Coordinated execution: Route -> Execute inside selected cluster.
        """
        verdict = await self.route_mission(objective)
        logger.info(f"COORDINATOR: Mission routed to Cluster '{verdict.selected_cluster_id}' ({verdict.reasoning})")
        
        cluster = self.clusters.get(verdict.selected_cluster_id)
        if not cluster:
            raise ValueError(f"COORDINATOR: Selected cluster {verdict.selected_cluster_id} is offline.")
            
        return await cluster.execute_task(objective)
