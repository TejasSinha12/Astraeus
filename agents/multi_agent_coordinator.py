"""
Handles delegation and communication between multiple active agents.
"""
from typing import Dict, List, Optional
import asyncio

from agents.base_agent import BaseAgent
from utils.logger import logger

class MultiAgentCoordinator:
    """
    Acts as the swarm manager. Can spawn, query, and forcefully halt agents.
    Provides a routing layer for a single user goal to be split among agents.
    """

    def __init__(self):
        self._registry: Dict[str, BaseAgent] = {}
        logger.info("MultiAgentCoordinator initialized.")

    def register_agent(self, agent: BaseAgent) -> None:
        if agent.agent_id in self._registry:
            logger.warning(f"Agent {agent.agent_id} is already registered. Overwriting.")
        self._registry[agent.agent_id] = agent
        logger.info(f"Registered Agent: {agent.agent_id} ({agent.role})")

    async def get_swarm_status(self) -> Dict[str, Any]:
        """
        Polls all registered agents for their current operational state.
        """
        tasks = [agent.get_status() for agent in self._registry.values()]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        status_report = {}
        for agent_id, res in zip(self._registry.keys(), results):
            if isinstance(res, Exception):
                status_report[agent_id] = {"error": str(res)}
            else:
                status_report[agent_id] = res
                
        return status_report

    async def dispatch_task(self, task_description: str, target_agent_id: Optional[str] = None) -> bool:
        """
        Assigns a task to a specific agent, or fails if the agent is busy/missing.
        Future Enhancement: LLM-based routing to automatically select the best agent.
        """
        if not self._registry:
            logger.error("Dispatch Failed: No agents available in the swarm.")
            return False

        if target_agent_id:
            agent = self._registry.get(target_agent_id)
            if not agent:
                logger.error(f"Dispatch Failed: Agent {target_agent_id} not found.")
                return False
        else:
            # Simple round robin / random availability check if no target specified
            available_agents = [a for a in self._registry.values() if not hasattr(a, 'is_active') or not a.is_active]
            if not available_agents:
                 logger.error("Dispatch Failed: All agents are busy.")
                 return False
            agent = available_agents[0]

        logger.info(f"Dispatching task to {agent.agent_id}...")
        return await agent.assign_task(task_description)

    async def emergency_stop_all(self) -> None:
        """
        Halt the entire swarm.
        """
        logger.critical("EMERGENCY STOP INITIATED. Halting all agents.")
        tasks = [agent.force_halt() for agent in self._registry.values()]
        await asyncio.gather(*tasks, return_exceptions=True)
