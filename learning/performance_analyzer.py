"""
Updates internal models or heuristic databases based on Reflection Reports.
"""
from typing import Dict, Any, List
import json
import os

from learning.self_reflection import ReflectionReport
from core_config import config
from utils.logger import logger

class PerformanceAnalyzer:
    """
    Persists improvement strategies into a specific subset of long-term memory
    designated as `system_heuristics`. This acts as a reinforcement layer over time.
    """

    def __init__(self):
        """
        Bootstraps a local file representing "learned rules" for the Decision Engine to inject.
        """
        self.heuristics_file = f"{config.MEMORY_INDEX_PATH}_heuristics.json"
        self.learned_rules = self._load()
        logger.info(f"PerformanceAnalyzer loaded {len(self.learned_rules)} learned rules.")

    def _load(self) -> List[str]:
        if os.path.exists(self.heuristics_file):
            with open(self.heuristics_file, 'r') as f:
                return json.load(f)
        return []

    def _save(self):
        os.makedirs(os.path.dirname(self.heuristics_file), exist_ok=True)
        with open(self.heuristics_file, 'w') as f:
            json.dump(self.learned_rules, f)

    def apply_learning(self, report: ReflectionReport) -> None:
        """
        Stores the improvement strategy permanently. Over time these rules
        can be clustered or pruned by another LLM task, but for now they strictly grow.
        
        Args:
            report: The output of the SelfReflection module.
        """
        rule = report.improvement_strategy
        if rule not in self.learned_rules:
            self.learned_rules.append(rule)
            self._save()
            logger.info(f"Learned rule applied to system heuristics: {rule[:50]}...")
        else:
            logger.debug("Rule was already present in system heuristics. Ignoring.")
            
    def get_learned_heuristics(self) -> str:
        """
        Fetches all current heuristics as a formatted block to be injected into system prompts.
        """
        if not self.learned_rules:
            return "No learned heuristics yet."
            
        rules = "\n".join([f"- {rule}" for rule in self.learned_rules])
        return f"Learned Heuristics (CRITICAL Rules you must follow):\n{rules}"
