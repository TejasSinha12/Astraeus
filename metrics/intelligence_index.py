"""
Intelligence Index for Project Ascension.
Aggregates longitudinal benchmark deltas and entropy reduction trends into a single predictive model.
"""
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
import time
import numpy as np
from utils.logger import logger

class IntelligenceSnapshot(BaseModel):
    timestamp: float
    fitness_score: float
    entropy: float
    token_efficiency: float
    calibration_accuracy: float # Predicted vs Actual delta accuracy

class IntelligenceIndex:
    """
    Predictive analytics engine for tracing the trajectory of AGI intelligence evolution.
    """

    def __init__(self):
        self.snapshots: List[IntelligenceSnapshot] = []
        logger.info("IntelligenceIndex online. Monitoring longitudinal drift.")

    def record_snapshot(self, metrics: Dict[str, Any]):
        """
        Captures a high-fidelity state of the current intelligence level.
        """
        snapshot = IntelligenceSnapshot(
            timestamp=time.time(),
            fitness_score=metrics.get('fitness_score', 0.0),
            entropy=metrics.get('entropy', 1.0),
            token_efficiency=metrics.get('token_efficiency', 0.0),
            calibration_accuracy=metrics.get('calibration_accuracy', 0.0)
        )
        self.snapshots.append(snapshot)
        logger.info(f"SNAPSHOT RECORDED: Fitness={snapshot.fitness_score:.4f} | Entropy={snapshot.entropy:.4f}")

    def calculate_trajectory(self, window_size: int = 10) -> Dict[str, float]:
        """
        Analyzes the trend line of intelligence gains.
        Returns a predictive slope for the next N missions.
        """
        if len(self.snapshots) < 2:
            return {"slope": 0.0, "prediction": 0.0}

        # Sub-window analysis
        recent = self.snapshots[-window_size:]
        x = np.array([s.timestamp for s in recent])
        y = np.array([s.fitness_score for s in recent])

        # Normalize X for regression
        x_norm = (x - x[0]) / (x[-1] - x[0] + 1e-9)
        
        # Simple Linear Regression slope
        coeffs = np.polyfit(x_norm, y, 1)
        slope = coeffs[0]

        logger.info(f"EVOLUTIONARY TRAJECTORY: Current Slope: {slope:.4f}")
        
        return {
            "slope": slope,
            "predicted_gain_next_mission": slope / window_size,
            "stability": 1.0 - np.var(y) # High variance = low stability
        }

    def get_historical_data(self) -> List[IntelligenceSnapshot]:
        return self.snapshots
