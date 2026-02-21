"""
Self-Reflection module driving iterative improvement.
"""
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class ReflectionReport(BaseModel):
    """
    Standardized block defining internal retrospective analysis.
    """
    what_worked: str = Field(description="Tactics that successfully moved closer to the goal.")
    what_failed: str = Field(description="Actions or logic chains that caused stalls or errors.")
    root_cause: str = Field(description="Deep analysis on *why* the failures occurred.")
    improvement_strategy: str = Field(description="Actionable rule update for future tasks.")

class SelfReflectionModule:
    """
    Ingests execution traces and outputs structured reasoning identifying flaws and proposing
    new heuristic rules.
    """

    def __init__(self, engine: ReasoningEngine):
        self.engine = engine
        logger.debug("SelfReflectionModule operational.")

    async def generate_reflection(
        self,
        task_goal: str,
        execution_trace: str,
        success: bool,
        external_criticism: Optional[str]
    ) -> ReflectionReport:
        """
        Instructs the LLM to criticize its own past performance on a task.
        """
        sys_prompt = (
            "You are the Self-Reflection Module for an advanced AGI.\n"
            "Review the provided execution trace. Look at the outcome. Identify exactly "
            "where the logic went wrong, or what was handled masterfully.\n"
            "Your output 'improvement_strategy' must be a clear, reusable heuristic rule."
        )

        user_prompt = f"Goal:\n{task_goal}\n\nOutcome Success: {success}\n\n"
        if external_criticism:
             user_prompt += f"USER FEEDBACK / CRITICISM:\n{external_criticism}\n\n"
             
        user_prompt += f"Execution Trace:\n{execution_trace}\n"

        logger.info("Executing self-reflection analysis inference...")
        report = await self.engine.generate_response(
            system_prompt=sys_prompt,
            user_prompt=user_prompt,
            temperature=0.2, # Low hallucination for pure facts
            response_model=ReflectionReport
        )
        return report
