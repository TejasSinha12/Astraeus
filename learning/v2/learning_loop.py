"""
Learning Loop v2 for Project Ascension.
Connects the SelfReflection module with the statistical Heuristic Optimizer.
"""
from typing import Optional

from core.reasoning_engine import ReasoningEngine
from learning.self_reflection import SelfReflectionModule, ReflectionReport
from optimization.heuristic_optimizer import HeuristicOptimizer
from metrics.telemetry import tracker
from utils.logger import logger

class ContinuousLearningLoop:
    """
    Ingests failure/success telemetry, triggers qualitative reflection, and automatically 
    pushes the proposed rule into the A/B testing optimization gauntlet.
    """

    def __init__(self, engine: ReasoningEngine, optimizer: HeuristicOptimizer):
        self.engine = engine
        self.reflector = SelfReflectionModule(engine)
        self.optimizer = optimizer
        logger.info("ContinuousLearningLoop v2 operational.")

    async def ingest_task_outcome(
        self,
        task_id: str,
        goal: str,
        execution_trace: str,
        success: bool,
        external_feedback: Optional[str] = None
    ) -> ReflectionReport:
        """
        Processes an episode outcome. If it failed (or had external criticism), it reflects
        and attempts to generate a new system rule.
        """
        logger.info(f"Loop v2 processing outcome for Task {task_id}.")
        
        # 1. Qualitative Analysis
        report = await self.reflector.generate_reflection(
            task_goal=goal,
            execution_trace=execution_trace,
            success=success,
            external_criticism=external_feedback
        )
        logger.info(f"Reflection generated proposed rule: {report.improvement_strategy[:50]}...")
        
        # 2. Only run the optimization testing suite if the rule is structurally new and triggered by a failure
        if not success or external_feedback:
            logger.info("Failure triggered rigorous heuristic evaluation...")
            # Run the benchmark sandbox
            current_version = tracker.current_version
            promoted = await self.optimizer.evaluate_new_rule(
                new_rule_text=report.improvement_strategy,
                current_version=current_version
            )
            
            if promoted:
                # 3. If promoted, we would theoretically bump the system version natively here
                # E.g., tracker.current_version = "v1.0.1-alpha"
                logger.info(f"System successfully evolved capabilities. Learned: {report.improvement_strategy}")
            else:
                 logger.warning("Proposed rule rejected by empirical benchmarks. No system alteration made.")
                 
        return report
