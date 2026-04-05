"""
Adaptive Pricing Engine for the Ascension Intelligence Economy.
Dynamically adjusts token costs based on computational demand and objective complexity.
"""
from typing import Dict, Any, Optional
from core.global_coordinator import GlobalCoordinator
from utils.logger import logger

class AdaptivePricingEngine:
    """
    Determines execution costs in real-time.
    Formula: Base * LoadFactor * ComplexityMultiplier
    """

    def __init__(self, coordinator: GlobalCoordinator):
        self.coordinator = coordinator
        self.base_execution_cost = 10.0 # Base tokens per mission

    def calculate_dynamic_surge(self) -> float:
        """
        Dynamically adjusts execution pricing globally based on active orchestration load.
        """
        # Mock active check - if priority_queues exist, sum them. Otherwise use cluster len.
        active_missions = sum(len(q) for q in getattr(self.coordinator, "priority_queues", {}).values()) \
                          if getattr(self.coordinator, "priority_queues", None) \
                          else len(self.coordinator.clusters)
        
        surge = 1.0 + (active_missions * 0.05)
        return min(3.0, surge) # Cap surge at 300%

    def get_tier_discount(self, reputation_score: float) -> float:
        """
        Returns a cost discount multiplier based on user reputation tiers.
        """
        if reputation_score >= 8.0:
            return 0.70 # Alpha Tier: 30% discount
        elif reputation_score >= 5.0:
            return 0.85 # Beta Tier: 15% discount
        return 1.00 # Gamma Tier: Standard pricing

    def calculate_cost(self, objective: str, cluster_id: str, user_reputation: float = 1.0) -> float:
        """
        Estimates the cost of a mission before execution.
        """
        # 1. Complexity Multiplier (heuristic)
        complexity = 1.0
        if any(w in objective.lower() for w in ["optimize", "refactor", "complex", "research"]):
            complexity = 1.5
        elif len(objective.split()) > 50:
            complexity = 1.3
            
        # 2. Load Factor (determined by global cluster utilization)
        # Mock: In a real system, the coordinator would track active missions per cluster
        num_clusters = len(self.coordinator.clusters)
        load_factor = 1.0
        if num_clusters > 0:
            # Simple assumption: more active clusters -> more coordination overhead
            load_factor = 1.0 + (num_clusters * 0.05) 
            
        total_cost = self.base_execution_cost * load_factor * complexity * self.calculate_dynamic_surge()
        final_cost = total_cost * self.get_tier_discount(user_reputation)
        
        logger.info(f"PRICING: Estimated cost for Cluster '{cluster_id}': {final_cost:.2f} tokens (Load: {load_factor:.2f}, Surge: {self.calculate_dynamic_surge():.2f})")
        return final_cost

    def get_dynamic_quotes(self, objective: str, user_reputation: float = 1.0) -> Dict[str, float]:
        """
        Returns estimated quotes for all available clusters in the marketplace.
        """
        quotes = {}
        for cid in self.coordinator.clusters.keys():
            quotes[cid] = self.calculate_cost(objective, cid, user_reputation)
        return quotes
