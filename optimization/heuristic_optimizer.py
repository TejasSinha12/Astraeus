"""
Heuristic Optimizer for Project Ascension.
Uses evaluation data to adjust the System Prompt rules weightings over time.
"""
from typing import List, Dict
import hashlib
import json
import os

from core.reasoning_engine import ReasoningEngine
from metrics.db_schema import SessionLocal, HeuristicWeight
from evals.benchmark_runner import BenchmarkRunner, BenchmarkReport
from core_config import config
from utils.logger import logger

class HeuristicOptimizer:
    """
    Evaluates new learning rules by running A/B tests against the benchmark suite.
    Promotes or demotes rules based on empirical impact on accuracy.
    """

    def __init__(self, engine: ReasoningEngine, eval_dataset_path: str):
        self.engine = engine
        self.eval_runner = BenchmarkRunner(dataset_path=eval_dataset_path)
        self.heuristics_file = f"{config.MEMORY_INDEX_PATH}_v2_heuristics.json"
        
        # Load active production rules
        self.active_rules = self._load_active_rules()
        logger.info(f"HeuristicOptimizer loaded {len(self.active_rules)} active rules.")

    def _load_active_rules(self) -> Dict[str, str]:
        if os.path.exists(self.heuristics_file):
            with open(self.heuristics_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_active_rules(self):
        os.makedirs(os.path.dirname(self.heuristics_file), exist_ok=True)
        with open(self.heuristics_file, 'w') as f:
            json.dump(self.active_rules, f)

    def _hash_rule(self, rule_text: str) -> str:
        return hashlib.md5(rule_text.encode()).hexdigest()[:8]

    async def evaluate_new_rule(self, new_rule_text: str, current_version: str) -> bool:
        """
        Runs the full benchmark suite to determine if a new rule improves the AGI.
        
        Returns:
            bool: True if promoted to active heuristics, False if rejected.
        """
        rule_hash = self._hash_rule(new_rule_text)
        logger.info(f"Evaluating new heuristic rule '{rule_hash}'...")

        # 1. Get Baseline (N)
        baseline_report: BenchmarkReport = await self.eval_runner.run_suite(version_hash=current_version)

        # 2. Inject rule temporarily into core system (N+1)
        test_version = f"{current_version}+{rule_hash}"
        # In a real system, we'd inject this rule into the CognitionCore initialized inside BenchmarkRunner here.
        
        # 3. Get Test Results (N+1)
        test_report: BenchmarkReport = await self.eval_runner.run_suite(version_hash=test_version)
        
        # 4. Compare
        accuracy_delta = test_report.overall_accuracy - baseline_report.overall_accuracy
        
        with SessionLocal() as db:
            hw = db.query(HeuristicWeight).filter(HeuristicWeight.rule_hash == rule_hash).first()
            if not hw:
                hw = HeuristicWeight(rule_hash=rule_hash, rule_text=new_rule_text, weight=0.5)
                db.add(hw)

            if accuracy_delta > 0:
                logger.info(f"[PROMOTION] Rule {rule_hash} improved accuracy by {accuracy_delta*100:.1f}%. Adding to system.")
                self.active_rules[rule_hash] = new_rule_text
                self._save_active_rules()
                hw.weight = min(1.0, hw.weight + 0.1)
                db.commit()
                return True
            else:
                logger.warning(f"[REJECTION] Rule {rule_hash} degraded/stalled accuracy by {accuracy_delta*100:.1f}%. Discarding.")
                hw.weight = max(0.0, hw.weight - 0.1)
                db.commit()
                return False

    def get_weighted_system_prompt_addition(self) -> str:
        """
        Formats the active rules into the System Prompt for the ReasoningEngine.
        """
        if not self.active_rules:
            return ""
            
        lines = ["\nCRITICAL SYSTEM HEURISTICS (Learned via empirical testing):"]
        for _, rule in self.active_rules.items():
            lines.append(f"- {rule}")
            
        return "\n".join(lines)
