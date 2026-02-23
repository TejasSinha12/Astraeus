"""
Experiment Manager for Project Ascension.
Handles controlled A/B evolution experiments with control branches and hypothesis tagging.
"""
import time
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from utils.logger import logger

class Hypothesis(BaseModel):
    objective: str
    target_metric: str # e.g., 'avg_complexity', 'entropy', 'token_efficiency'
    predicted_delta: float
    reasoning: str

class EvolutionExperiment(BaseModel):
    id: str
    start_time: float
    hypothesis: Hypothesis
    control_branch: str = "main"
    experimental_branch: str
    status: str = "RUNNING" # 'RUNNING', 'VALIDATED', 'FAILED', 'PLATEAU'

class ExperimentManager:
    """
    Scientific coordinator for longitudinal intelligence studies.
    """

    def __init__(self, output_dir: str = "evals/experiments"):
        self.output_dir = output_dir
        self.active_experiments: Dict[str, EvolutionExperiment] = {}
        logger.info("ExperimentManager online. Ready for controlled evolution runs.")

    def launch_experiment(self, hypothesis: Hypothesis) -> EvolutionExperiment:
        """
        Initializes a new A/B experiment with a unique branch and tagged hypothesis.
        """
        exp_id = f"exp_{int(time.time())}"
        branch_name = f"experiment/{exp_id}"
        
        experiment = EvolutionExperiment(
            id=exp_id,
            start_time=time.time(),
            hypothesis=hypothesis,
            experimental_branch=branch_name
        )
        
        self.active_experiments[exp_id] = experiment
        logger.info(f"EXPERIMENT LAUNCHED: {exp_id} -> Target: {hypothesis.target_metric} ({hypothesis.predicted_delta})")
        return experiment

    def detect_plateau(self, progress_history: List[float], window: int = 5) -> bool:
        """
        Checks if recent evolutionary gains have flattened out.
        """
        if len(progress_history) < window:
            return False
            
        recent = progress_history[-window:]
        # If variance is extremely low, we've likely plateaued
        import numpy as np
        variance = np.var(recent)
        
        if variance < 0.0001:
            logger.warning("EVOLUTIONARY PLATEAU DETECTED: Intelligence gains have stagnated.")
            return True
        return False
