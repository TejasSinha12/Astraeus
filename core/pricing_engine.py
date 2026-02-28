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

    def calculate_cost(self, objective: str, cluster_id: str) -> float:
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
            
        total_cost = self.base_execution_cost * load_factor * complexity
        
        logger.info(f"PRICING: Estimated cost for Cluster '{cluster_id}': {total_cost:.2f} tokens (Load: {load_factor:.2f}, Complexity: {complexity:.2f})")
        return total_cost

    def get_dynamic_quotes(self, objective: str) -> Dict[str, float]:
        """
        Returns estimated quotes for all available clusters in the marketplace.
        """
        quotes = {}
        for cid in self.coordinator.clusters.keys():
            quotes[cid] = self.calculate_cost(objective, cid)
        return quotes
