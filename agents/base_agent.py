"""
Base contract for any agent operating within Project Ascension.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseAgent(ABC):
    """
    Abstract interface guaranteeing all agents can communicate and receive tasks
    standardly.
    """

    def __init__(self, agent_id: str, role: str):
        self.agent_id = agent_id
        self.role = role

    @abstractmethod
    async def assign_task(self, task_description: str, context: Optional[str] = None) -> bool:
        """
        Pushes a new objective to the agent.
        Returns True if accepted.
        """
        pass

    @abstractmethod
    async def get_status(self) -> Dict[str, Any]:
        """
        Returns JSON-serializable state representing what the agent is currently doing.
        """
        pass

    @abstractmethod
    async def force_halt(self) -> None:
        """
        Emergency stop triggered by the Coordinator or Sandbox.
        """
        pass
