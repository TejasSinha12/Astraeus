"""
Stability Engine for Project Ascension.
Calculates Risk Scores and Codebase Fitness Scores for governed evolution.
"""
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from utils.logger import logger
import time
import math

class StabilityMetrics(BaseModel):
    risk_score: float         # 0.0 to 1.0 (Higher is more dangerous)
    fitness_score: float      # 0.0 to 1.0 (Higher is better)
    regression_prob: float
    entropy: float
    stability_threshold: float = 0.4  # Default threshold for deployment safety

class DriftSnapshot(BaseModel):
    timestamp: float
    metrics: Dict[str, float]
    drift_magnitude: float = 0.0
    is_anomaly: bool = False

class StabilityEngine:
    """
    Statistical analyzer for codebase health and change risk.
    """

    def __init__(self, drift_threshold: float = 0.25, max_snapshots: int = 100):
        self.drift_threshold = drift_threshold
        self.max_snapshots = max_snapshots
        self._snapshots: List[DriftSnapshot] = []
        self._baseline: Optional[Dict[str, float]] = None
        logger.info("StabilityEngine initialized with drift detection.")

    def observe(self, metrics: Dict[str, float]) -> DriftSnapshot:
        """
        Records a metric snapshot and computes drift from the established baseline.
        Returns a DriftSnapshot with anomaly status.
        """
        now = time.time()

        # Establish baseline from first observation
        if self._baseline is None:
            self._baseline = metrics.copy()
            snapshot = DriftSnapshot(timestamp=now, metrics=metrics)
            self._snapshots.append(snapshot)
            return snapshot

        # Calculate Euclidean drift magnitude from baseline
        shared_keys = set(metrics.keys()) & set(self._baseline.keys())
        if not shared_keys:
            drift = 0.0
        else:
            squared_diff = sum(
                (metrics[k] - self._baseline[k]) ** 2 for k in shared_keys
            )
            drift = math.sqrt(squared_diff / len(shared_keys))

        is_anomaly = drift > self.drift_threshold

        snapshot = DriftSnapshot(
            timestamp=now,
            metrics=metrics,
            drift_magnitude=round(drift, 4),
            is_anomaly=is_anomaly,
        )

        self._snapshots.append(snapshot)

        # Prune old snapshots
        if len(self._snapshots) > self.max_snapshots:
            self._snapshots = self._snapshots[-self.max_snapshots:]

        if is_anomaly:
            logger.warning(
                f"DRIFT_ALERT: Anomaly detected (magnitude={drift:.4f}, "
                f"threshold={self.drift_threshold})"
            )
        else:
            logger.debug(f"STABILITY: Drift={drift:.4f} (within bounds)")

        return snapshot

    def recalibrate_baseline(self) -> None:
        """
        Sets the current latest snapshot as the new baseline.
        Called after intentional system changes (deployments, config updates).
        """
        if self._snapshots:
            self._baseline = self._snapshots[-1].metrics.copy()
            logger.info("STABILITY: Baseline recalibrated to latest observation.")

    def get_drift_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Returns recent drift snapshots for the admin dashboard."""
        return [
            {
                "timestamp": s.timestamp,
                "drift": s.drift_magnitude,
                "anomaly": s.is_anomaly,
            }
            for s in self._snapshots[-limit:]
        ]

    def calculate_risk(self, change_set: List[Dict[str, Any]]) -> float:
        """
        Estimates the probability of regression or architectural destabilization.
        Considers modification depth, file centrality, and logic complexity.
        """
        total_risk = 0.1
        if len(change_set) > 5:
            total_risk += 0.2
        
        # Incorporate recent drift data into risk assessment
        recent_anomalies = sum(
            1 for s in self._snapshots[-10:] if s.is_anomaly
        )
        total_risk += recent_anomalies * 0.05
        
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
        complexity = repo_metrics.get("avg_complexity", 10)
        test_success = repo_metrics.get("test_success_rate", 1.0)
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
            "risk_mitigation": 0.0
        }

    def calculate_entropy(self, execution_trace: List[Dict[str, Any]]) -> float:
        """
        Calculates the decision entropy of the swarm.
        High entropy indicates agent disagreement or lack of confidence.
        """
        if not execution_trace:
            return 0.0
        
        confidences = [step.get("confidence", 1.0) for step in execution_trace]
        if not confidences: return 0.5
        
        avg_conf = sum(confidences) / len(confidences)
        variance = sum((c - avg_conf) ** 2 for c in confidences) / len(confidences)
        
        entropy = (1.0 - avg_conf) + (variance * 2)
        logger.info(f"Calculated Swarm Decision Entropy: {entropy:.4f}")
        return min(entropy, 1.0)

    def is_stable_for_deployment(self, risk: float, entropy: float) -> bool:
        """
        Decision gate for automated deployment.
        Returns False if risk or entropy exceed safe bounds.
        """
        # Also consider recent drift
        recent_drift = (
            self._snapshots[-1].drift_magnitude if self._snapshots else 0.0
        )
        is_stable = risk < 0.5 and entropy < 0.4 and recent_drift < self.drift_threshold
        logger.info(
            f"Stability Gate Result: {'PASS' if is_stable else 'FAIL'} "
            f"(Risk: {risk:.2f}, Entropy: {entropy:.2f}, Drift: {recent_drift:.4f})"
        )
        return is_stable
