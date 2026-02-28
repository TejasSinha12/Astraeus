"""
Marketplace Manager for the Ascension Intelligence Economy.
Enables swarm clusters to publish and monetize their unique capabilities.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import datetime

from api.usage_db import SwarmCluster, SessionLocal
from utils.logger import logger

class MarketplaceCapability(BaseModel):
    swarm_id: str
    name: str
    region: str
    base_cost: float # Token cost per execution
    expertise: List[str]
    reliability_score: float
    is_public: bool

class MarketplaceManager:
    """
    Discovery and monetization layer for the distributed intelligence federation.
    Registers clusters as addressable endpoints in the global marketplace.
    """

    def __init__(self):
        logger.info("MarketplaceManager online. Syncing global capabilities...")

    def list_market_endpoints(self) -> List[MarketplaceCapability]:
        """
        Retrieves all valid, monetizable swarm endpoints.
        """
        try:
            with SessionLocal() as db:
                clusters = db.query(SwarmCluster).filter(SwarmCluster.is_active == True).all()
                import json
                
                return [
                    MarketplaceCapability(
                        swarm_id=c.id,
                        name=c.name,
                        region=c.region,
                        base_cost=10.0, # Target: Store this in a new SwarmProfile table
                        expertise=json.loads(c.expertise_tags) if c.expertise_tags else [],
                        reliability_score=0.95, # Mock: Integrate with StabilityEngine for real-time scores
                        is_public=True
                    ) for c in clusters
                ]
        except Exception as e:
            logger.error(f"MARKETPLACE: Listing failed: {e}")
            return []

    async def get_recommended_endpoint(self, objective: str) -> Optional[MarketplaceCapability]:
        """
        Recommends a swarm based on the objective and historical reliability.
        """
        endpoints = self.list_market_endpoints()
        if not endpoints:
            return None
            
        # Simplistic match for now: Return the one with the highest reliability score
        return max(endpoints, key=lambda x: x.reliability_score)
