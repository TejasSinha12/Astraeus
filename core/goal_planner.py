"""
Goal Planner for Project Ascension.
Responsible for breaking down major requests into executable subtasks.
"""
from typing import List, Optional
from pydantic import BaseModel, Field

from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class TaskDefinition(BaseModel):
    """
    Representation of a single task block.
    """
    id: str = Field(description="A unique, concise identifier for the task.")
    description: str = Field(description="A clear description of what needs to be accomplished.")
    dependencies: List[str] = Field(description="List of task `id`s that must be complete before this starts.")
    expected_outcome: str = Field(description="What a successful execution looks like.")

class Plan(BaseModel):
    """
    A sequence of dependent subtasks.
    """
    plan_overview: str = Field(description="High-level summary of the generated plan.")
    tasks: List[TaskDefinition] = Field(description="The tasks representing the directed acyclic graph to execute.")

class GoalPlanner:
    """
    Uses the cognitive capabilities to decompose abstract goals into Directed Acyclic Graphs of tasks.
    """

    def __init__(self, engine: ReasoningEngine):
        """
        Initializes the planner with an LLM execution proxy.
        """
        self.engine = engine
        logger.info("GoalPlanner initialized.")

    async def create_plan(self, high_level_goal: str, context: Optional[str] = None) -> Plan:
        """
        Decomposes a primary objective into discrete, typed actionable subgoals.

        Args:
            high_level_goal (str): The primary user directive or overarching objective.
            context (Optional[str]): Background data or currently known memory to guide planning.
        
        Returns:
            Plan: Structured array of dependencies and tasks.
        """
        sys_prompt = (
            "You are the Goal Decomposition Engine for a sophisticated AGI.\n"
            "Your task is to take a high-level goal and break it down into an ordered, logical plan of execution.\n"
            "Keep tasks distinct, highly executable, and explicitly define dependencies to form a valid DAG graph."
        )

        user_prompt = f"Goal:\n{high_level_goal}\n"
        if context:
            user_prompt += f"\nContext / Memory:\n{context}\n"

        user_prompt += "\nPlease construct a sequence of discrete `tasks` that achieves this goal."

        logger.info(f"Generating plan for goal: {high_level_goal[:50]}...")
        plan = await self.engine.generate_response(
            system_prompt=sys_prompt,
            user_prompt=user_prompt,
            temperature=0.3,
            response_model=Plan
        )
        logger.info(f"Plan generated successfully with {len(plan.tasks)} tasks.")
        return plan
