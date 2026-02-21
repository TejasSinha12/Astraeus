"""
Processes task outcomes and feedback to trigger learning events.
"""
from typing import Dict, Any, Optional

from core.reasoning_engine import ReasoningEngine
from learning.self_reflection import SelfReflectionModule, ReflectionReport
from memory.short_term_memory import ShortTermMemory
from utils.logger import logger

class FeedbackProcessor:
    """
    Acts as a gateway for post-task evaluation. Triggers the Reflection module.
    """

    def __init__(self, engine: ReasoningEngine):
        self.engine = engine
        self.reflector = SelfReflectionModule(engine=self.engine)
        logger.info("FeedbackProcessor and Reflection hooks initialized.")

    async def ingest_task_outcome(
        self,
        task_id: str,
        goal: str,
        execution_trace: str,
        success: bool,
        external_feedback: Optional[str] = None
    ) -> ReflectionReport:
        """
        Takes the raw data of a completed task and triggers a reflection cycle.
        
        Args:
            task_id: Unique task identifier.
            goal: What the system tried to do.
            execution_trace: The concatenated history of the episode.
            success: Whether it achieved the expected outcome.
            external_feedback: User corrections, if any.
            
        Returns:
            The generated ReflectionReport.
        """
        logger.info(f"Processing outcome for Task {task_id}. Success: {success}")
        
        report = await self.reflector.generate_reflection(
            task_goal=goal,
            execution_trace=execution_trace,
            success=success,
            external_criticism=external_feedback
        )
        
        logger.info(f"Task {task_id} generated reflection: {report.improvement_strategy[:50]}...")
        # TODO: Send report to PerformanceAnalyzer to update weights/heuristics.
        return report
