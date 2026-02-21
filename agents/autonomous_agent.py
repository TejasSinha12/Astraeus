"""
Fully autonomous agent utilizing the complete cognitive architecture.
"""
from typing import Any, Dict, Optional
import asyncio

from agents.base_agent import BaseAgent
from core.cognition import CognitionCore
from utils.logger import logger

class AutonomousAgent(BaseAgent):
    """
    The primary "AGI" construct. Spawns its own CognitionCore to independently
    plan, execute, and reflect on assigned goals.
    """

    def __init__(self, agent_id: str, role: str = "General Purpose AGI"):
        super().__init__(agent_id, role)
        
        # Each autonomous agent gets its own cognitive loop instances
        self.cognition = CognitionCore()
        
        self.current_goal: Optional[str] = None
        self.is_active: bool = False
        self._execution_task: Optional[asyncio.Task] = None

    async def assign_task(self, task_description: str, context: Optional[str] = None) -> bool:
        """
        Accepts a goal and spins off the cognitive execution loop into a background async task.
        """
        if self.is_active:
            logger.warning(f"Agent {self.agent_id} rejected task: Already busy.")
            return False

        self.current_goal = task_description
        self.is_active = True
        
        logger.info(f"Agent {self.agent_id} accepted goal: {task_description[:50]}...")
        
        # Dispatch the blocking cognitive loop into the background
        self._execution_task = asyncio.create_task(self._run_loop(goal=task_description))
        return True

    async def _run_loop(self, goal: str):
        """
        Internal wrapper to execute cognition and clean up state afterward.
        """
        try:
            await self.cognition.execute_goal(goal)
        except asyncio.CancelledError:
            logger.warning(f"Agent {self.agent_id} execution was forcefully cancelled.")
        except Exception as e:
            logger.error(f"Agent {self.agent_id} crashed during cognition loop: {e}")
        finally:
            self.is_active = False
            self.current_goal = None

    async def get_status(self) -> Dict[str, Any]:
        return {
            "agent_id": self.agent_id,
            "role": self.role,
            "is_active": self.is_active,
            "current_goal": self.current_goal
        }

    async def force_halt(self) -> None:
        if self._execution_task and not self._execution_task.done():
            self._execution_task.cancel()
            logger.critical(f"Agent {self.agent_id} forcefully halted.")
        self.is_active = False
