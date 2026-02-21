"""
Decision Engine for Project Ascension.
Determines the granular next action to take for a specific goal or subtask.
"""
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

from core.reasoning_engine import ReasoningEngine
from utils.logger import logger


class ToolCallDecision(BaseModel):
    """
    Representation of the decision to use a specific tool.
    """
    tool_name: str = Field(description="The exact name of the tool to execute.")
    arguments: Dict[str, Any] = Field(description="Parameters to pass to the tool matching its schema.")


class NextAction(BaseModel):
    """
    Structured envelope for the Decision Engine's verdict.
    """
    thought_process: str = Field(description="Step by step reasoning for the decision.")
    confidence_score: float = Field(description="0.0 to 1.0. How certain are you this action is mathematically/logically optimal. BE HONEST. Overconfidence is heavily penalized in system calibration loops.")
    action_type: str = Field(description="Must be one of: 'USE_TOOL', 'TASK_COMPLETE', 'FAIL'.")
    tool_call: Optional[ToolCallDecision] = Field(description="Populated if action_type is USE_TOOL.")
    response_or_summary: Optional[str] = Field(description="Populated if action_type is TASK_COMPLETE or FAIL. Summarizes outcome.")


class DecisionEngine:
    """
    Evaluates current state against the active task and selects the optimal next action.
    """

    def __init__(self, engine: ReasoningEngine):
        """
        Initializes the engine with an LLM execution proxy.
        """
        self.engine = engine
        logger.info("DecisionEngine initialized.")

    async def decide_next_step(
        self,
        task_description: str,
        recent_memory: str,
        available_tools: List[Dict[str, Any]]
    ) -> NextAction:
        """
        Calculates the single next optimal move for the AGI to progress its active task.

        Args:
            task_description (str): What the system is currently trying to accomplish.
            recent_memory (str): Observations, tool outputs, and short term context.
            available_tools (List[Dict[str, Any]]): Schemas describing available tools.
            
        Returns:
            NextAction: Structured instruction mapping to concrete execution pathways.
        """
        sys_prompt = (
            "You are the Decision Engine for an autonomous AGI.\n"
            "Evaluate the current task, review recent memory (outcomes of previous steps), "
            "and decide what MUST happen next.\n\n"
            "Rules:\n"
            "1. Choose a single tactical action.\n"
            "2. Ensure arguments match the signature of the tools exactly.\n"
            "3. If the task is verified complete based on memory, return TASK_COMPLETE with a detailed summary.\n"
            "4. If progress is impossible, return FAIL with a reason.\n"
            "5. META-COGNITION CALIBRATION: Evaluate your `confidence_score` critically. If you are hallucinating or guessing, lower the score below 0.5. Calibration metrics penalize high-confidence errors exponentially.\n"
        )

        user_prompt = f"Current Task:\n{task_description}\n\n"
        user_prompt += f"Recent Context / Memory:\n{recent_memory}\n\n"
        user_prompt += "Available Tools:\n"
        for tool in available_tools:
            user_prompt += f"- {tool['name']}: {tool['description']}\n  Schema: {tool['schema']}\n"

        logger.debug("Requesting NextAction verdict from LLM...")
        decision = await self.engine.generate_response(
            system_prompt=sys_prompt,
            user_prompt=user_prompt,
            temperature=0.1,  # Highly deterministic
            response_model=NextAction
        )
        logger.info(f"Decision made: {decision.action_type}")
        return decision
