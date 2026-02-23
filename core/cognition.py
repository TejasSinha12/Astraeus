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
from core.refinement_loop import RefinementLoop
from tools.tool_registry import ToolRegistry
from tools.tool_executor import ToolExecutor
from tools.file_system_tool import FileSystemTool
from tools.code_execution_tool import CodeExecutionTool
from tools.git_tool import GitTool

from core.swarm_orchestrator import SwarmOrchestrator
from core.refactoring_engine import RefactoringEngine
from core.evolution_manager import EvolutionManager

class CognitionCore:
    """
    The orchestrator module that manages the AGI lifecycle for a given overarching objective.
    Now upgraded to support Multi-Agent Swarm logic.
    """

    def __init__(self):
        """
        Bootstraps all internal modules (Swarm, Refactoring, Evolution).
        """
        self.reasoning = ReasoningEngine()
        self.swarm = SwarmOrchestrator(reasoning_engine=self.reasoning)
        self.evolver = EvolutionManager()
        self.refactor_engine = RefactoringEngine(orchestrator=self.swarm)
        
        # Keep legacy single-agent components for fallback/hybrid tasks
        self.planner = GoalPlanner(engine=self.reasoning)
        self.decision = DecisionEngine(engine=self.reasoning)
        self.refiner = RefinementLoop(engine=self.reasoning, token_controller=self.reasoning.tokens)
        
        self.tool_registry = ToolRegistry()
        self.tool_registry.register(FileSystemTool())
        self.tool_registry.register(CodeExecutionTool())
        self.tool_registry.register(GitTool())
        self.tool_executor = ToolExecutor(registry=self.tool_registry)
        logger.info("CognitionCore initialized with Swarm and Evolution tiers.")

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
            
            # Enforce token limit and check bandwidth
            bandwidth = self.reasoning.tokens.get_bandwidth_score()
            if bandwidth < 0.1:
                logger.warning(f"Extremely low bandwidth ({bandwidth:.2f}). Emergency optimization required.")

            decision: NextAction = await self.decision.decide_next_step(
                task_description=task.description,
                recent_memory=working_memory,
                available_tools=self.tool_registry.get_all_schemas()
            )

            # Route Decision
            if decision.action_type == "TASK_COMPLETE":
                logger.info(f"Task {task.id} finalized.")
                
                if config.DISABLE_REFINEMENT:
                    logger.info("Refinement skipped (DISABLE_REFINEMENT=True)")
                    return
                
                logger.info("Triggering final refinement pass.")
                # Multi-pass iterative refinement for the final response
                refined_response = await self.refiner.run_refinement(task.description, working_memory)
                logger.info(f"Refined Result Size: {len(refined_response)} chars")
                return

            elif decision.action_type == "FAIL":
                logger.error(f"Task {task.id} unrecoverable fail: {decision.response_or_summary}")
                # TODO: Trigger Error feedback loop / multi-agent assist
                return

            elif decision.action_type == "USE_TOOL":
                if decision.tool_call:
                    logger.info(f"Tool Dispatch -> {decision.tool_call.tool_name}({decision.tool_call.arguments})")
                    from core.decision_engine import ToolCallDecision
                    
                    tool_decision = ToolCallDecision(
                        tool_name=decision.tool_call.tool_name, 
                        arguments=decision.tool_call.arguments
                    )
                    
                    tool_result = await self.tool_executor.execute(tool_decision)
                    logger.debug(f"Tool Execution Result Loop: {len(tool_result)} bytes")
                    working_memory += f"\n[Step {step_count}] Used {decision.tool_call.tool_name}. Outcome:\n{tool_result}\n"
                
            else:
                logger.warning(f"Unknown action type generated: {decision.action_type}")
                return
                
        logger.error(f"Task {task.id} exceeded max steps ({config.MAX_PLANNING_STEPS}). Aborting.")
