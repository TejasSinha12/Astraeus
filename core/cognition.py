"""
Core cognitive hub for Project Ascension.
Provides the central loop integrating planning, reasoning, memory, and decision making.
"""
from typing import Optional, Any
from core_config import config
from utils.logger import logger

from core.reasoning_engine import ReasoningEngine
from core.goal_planner import GoalPlanner, Plan, TaskDefinition
from core.decision_engine import DecisionEngine, NextAction

class CognitionCore:
    """
    The orchestrator module that manages the AGI lifecycle for a given overarching objective.
    It bridges components that haven't been mocked yet, acting as the nexus point.
    """

    def __init__(self):
        """
        Bootstraps all internal modules (Planner, Decision Engine, LLM router).
        """
        self.reasoning = ReasoningEngine()
        self.planner = GoalPlanner(engine=self.reasoning)
        self.decision = DecisionEngine(engine=self.reasoning)
        logger.info("CognitionCore initialized and sub-modules bootstrapped.")

    async def execute_goal(self, goal: str) -> None:
        """
        The main processing loop. Breaks a goal into tasks, then loops through them.
        
        Args:
            goal (str): The primary objective to accomplish.
        """
        logger.info(f"Spawning cognitive lifecycle for goal: {goal}")

        # 1. Expand the objective into a DAG of subtasks
        # Note: Depending on the complexity, we would fetch Long Term Memory here contextually.
        plan: Plan = await self.planner.create_plan(
            high_level_goal=goal,
            context="Initial state. No previous memory loaded yet."
        )

        logger.info(f"Derived Plan strategy: {plan.plan_overview}")

        # 2. Iterate executable tasks sequentially (simplified execution DAG for now)
        for task in plan.tasks:
            await self._execute_task(task)
            
        logger.warning("Goal lifecycle completed. Awaiting full tool architecture for complete functionality.")

    async def _execute_task(self, task: TaskDefinition) -> None:
        """
        Tackles a single distinct task until completion or failure.
        """
        logger.info(f"Initializing task context -> ID: {task.id}")
        
        step_count = 0
        working_memory = f"Starting Task:\n{task.description}\nExpected Outcome:\n{task.expected_outcome}\n"

        while step_count < config.MAX_PLANNING_STEPS:
            step_count += 1
            
            # TODO: Fetch dynamically registered tools from tool_registry.py
            dummy_tools = [
                {
                    "name": "read_file",
                    "description": "Reads contents of a local file.",
                    "schema": {"path": "string"}
                }
            ]

            decision: NextAction = await self.decision.decide_next_step(
                task_description=task.description,
                recent_memory=working_memory,
                available_tools=dummy_tools
            )

            # Route Decision
            if decision.action_type == "TASK_COMPLETE":
                logger.info(f"Task {task.id} finalized: {decision.response_or_summary}")
                # TODO: Trigger SelfReflection and MemoryConsolidation here
                return

            elif decision.action_type == "FAIL":
                logger.error(f"Task {task.id} unrecoverable fail: {decision.response_or_summary}")
                # TODO: Trigger Error feedback loop / multi-agent assist
                return

            elif decision.action_type == "USE_TOOL":
                if decision.tool_call:
                    logger.info(f"Tool Dispatch -> {decision.tool_call.tool_name}({decision.tool_call.arguments})")
                    # TODO: Execute via tool_executor
                    working_memory += f"\n[Step {step_count}] Used {decision.tool_call.tool_name}. Outcome queued.\n"
                
            else:
                logger.warning(f"Unknown action type generated: {decision.action_type}")
                return
                
        logger.error(f"Task {task.id} exceeded max steps ({config.MAX_PLANNING_STEPS}). Aborting.")
