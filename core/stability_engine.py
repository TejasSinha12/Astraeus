"""
Stability Engine for Project Ascension.
Calculates Risk Scores and Codebase Fitness Scores for governed evolution.
"""
from typing import Dict, Any, List
from pydantic import BaseModel
from utils.logger import logger

class StabilityMetrics(BaseModel):
    risk_score: float         # 0.0 to 1.0 (Higher is more dangerous)
    fitness_score: float      # 0.0 to 1.0 (Higher is better)
    regression_prob: float
    entropy: float
    stability_threshold: float = 0.4  # Default threshold for deployment safety

class StabilityEngine:
    """
    Statistical analyzer for codebase health and change risk.
    """

    def __init__(self):
        logger.info("StabilityEngine initialized.")

    def calculate_risk(self, change_set: List[Dict[str, Any]]) -> float:
        """
        Estimates the probability of regression or architectural destabilization.
        Considers modification depth, file centrality, and logic complexity.
        """
        # Placeholder for complex statistical model
        # Heuristic: More files + higher existing complexity = higher risk
        total_risk = 0.1
        if len(change_set) > 5:
            total_risk += 0.2
        
        logger.info(f"Calculated Change Risk Score: {total_risk:.2f}")
        return min(total_risk, 1.0)

    def calculate_fitness(self, repo_metrics: Dict[str, Any]) -> float:
        """
        Computes the 'Codebase Fitness Score' as a composite of:
        - Maintainability Index
        - Dependency Entropy
        - Token Efficiency (Token-per-Logic-Unit)
        - Correctness Rate (Test Success)
        """
        # Composite calculation
        complexity = repo_metrics.get("avg_complexity", 10)
        test_success = repo_metrics.get("test_success_rate", 1.0)
        
        # Fitness = (1 / Complexity) * TestSuccess
        # (Very simplified for MVP; will expand with entropy/token ratio)
        fitness = (10 / max(1, complexity)) * test_success
        
        logger.info(f"Calculated Codebase Fitness Score: {fitness:.4f}")
        return min(fitness, 1.0)

    def generate_metrics_diff(self, old_metrics: Dict[str, Any], new_metrics: Dict[str, Any]) -> Dict[str, float]:
        """
        Compares system state before and after a change to determine if it should be integrated.
        """
        v1_fit = self.calculate_fitness(old_metrics)
        v2_fit = self.calculate_fitness(new_metrics)
        
        return {
            "fitness_delta": v2_fit - v1_fit,
            "risk_mitigation": 0.0 # Placeholder
        }

    def calculate_entropy(self, execution_trace: List[Dict[str, Any]]) -> float:
        """
        Calculates the decision entropy of the swarm.
        High entropy indicates agent disagreement or lack of confidence.
        """
        if not execution_trace:
            return 0.0
        
        # Heuristic: Variation in confidence scores and agent conflict counts
        confidences = [step.get("confidence", 1.0) for step in execution_trace]
        if not confidences: return 0.5
        
        avg_conf = sum(confidences) / len(confidences)
        variance = sum((c - avg_conf) ** 2 for c in confidences) / len(confidences)
        
        # Entropy = 1 - AvgConfidence + Variance
        entropy = (1.0 - avg_conf) + (variance * 2)
        logger.info(f"Calculated Swarm Decision Entropy: {entropy:.4f}")
        return min(entropy, 1.0)

    def is_stable_for_deployment(self, risk: float, entropy: float) -> bool:
        """
        Decision gate for automated deployment.
        Returns False if risk or entropy exceed safe bounds.
        """
        is_stable = risk < 0.5 and entropy < 0.4
        logger.info(f"Stability Gate Result: {'PASS' if is_stable else 'FAIL'} (Risk: {risk:.2f}, Entropy: {entropy:.2f})")
        return is_stable
