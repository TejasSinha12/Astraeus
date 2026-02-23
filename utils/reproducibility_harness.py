"""
Reproducibility Harness for Project Ascension.
Ensures deterministic execution and seeded random states for swarm experiments.
"""
import random
import numpy as np
from typing import Optional
from utils.logger import logger

class ReproducibilityHarness:
    """
    Enforces seeds and deterministic state management for evolutionary runs.
    """

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.enforce_seed(seed)
        logger.info(f"ReproducibilityHarness active. Seed: {seed}")

    def enforce_seed(self, seed: Optional[int] = None):
        """
        Global application of the random seed.
        """
        target_seed = seed or self.seed
        random.seed(target_seed)
        np.random.seed(target_seed)
        # Note: True deterministicity in LLMs requires 'seed' param in API call, 
        # which is handled in ReasoningEngine if supported by provider.
        logger.debug(f"Deterministic seed {target_seed} applied to local environment.")

    def get_execution_context(self) -> dict:
        """
        Returns a context signature to ensure the environment is consistent.
        """
        return {
            "seed": self.seed,
            "deterministic_io": True
        }
