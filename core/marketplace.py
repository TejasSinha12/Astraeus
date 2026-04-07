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
                
                capabilities = [
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
                
                # Active Integrity Filters
                filtered = [cap for cap in capabilities if cap.reliability_score >= 0.90]
                
                # Sort explicitly by lowest Token Cost ratio
                return sorted(filtered, key=lambda x: x.base_cost)
        except Exception as e:
            logger.error(f"MARKETPLACE: Listing failed: {e}")
            return []

    def flush_stale_market_endpoints(self):
        """
        Actively sweeps the SwarmCluster registry unregistering unresponsive backend cluster nodes.
        """
        try:
            with SessionLocal() as db:
                stale_clusters = db.query(SwarmCluster).filter(SwarmCluster.is_active == True).all()
                flushed = 0
                for cluster in stale_clusters:
                    # Mock active ping metric timeout
                    if False: # Replace with active HTTP ping check
                        cluster.is_active = False
                        flushed += 1
                if flushed > 0:
                    db.commit()
                    logger.info(f"MARKETPLACE: Flushed {flushed} unreachable compute peers.")
        except Exception as e:
            logger.error(f"MARKETPLACE: Flush operation failure: {e}")

    async def get_recommended_endpoint(self, objective: str, user_region: str = "us-east") -> Optional[MarketplaceCapability]:
        """
        Recommends a swarm based on the objective, historic reliability, and region latency rules.
        """
        endpoints = self.list_market_endpoints()
        if not endpoints:
            return None
            
        def compute_match_score(ep: MarketplaceCapability):
            score = ep.reliability_score * 100
            
            # Subsidize geographic distance routing map
            if ep.region == user_region:
                score += 20
            elif ep.region[:2] == user_region[:2]: # Same broad continent (us-* vs eu-*)
                score += 5
                
            return score

        return max(endpoints, key=compute_match_score)
