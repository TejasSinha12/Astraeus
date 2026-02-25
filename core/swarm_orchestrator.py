"""
Swarm Orchestrator for Project Ascension.
Manages the lifecycle, communication, and task delegation of a multi-agent workforce.
"""
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.reasoning_engine import ReasoningEngine
from agents.swarm_profiles import AGENT_REGISTRY, AgentProfile, SwarmCommunication
from utils.logger import logger

class SwarmOrchestrator:
    """
    Coordinates interactions between specialized agents to solve complex objectives.
    """

    def __init__(self, reasoning_engine: ReasoningEngine):
        self.reasoning = reasoning_engine
        self.active_agents: Dict[str, AgentProfile] = AGENT_REGISTRY
        logger.info(f"SwarmOrchestrator online with {len(self.active_agents)} specialized agent profiles.")

    async def execute_swarm_objective(self, objective: str) -> Dict[str, Any]:
        """
        Hierarchical execution objective through the swarm.
        Returns a structured result: {"content": str, "is_multifile": bool, "file_map": dict}
        """
        logger.info(f"Swarm mobilization triggered for objective: {objective}")

        # 1. PLAN (Planner Agent)
        plan = await self._delegate_to_agent("planner", f"Decompose this objective into a DAG: {objective}")
        logger.info("Swarm Plan phase complete.")

        # 2. DESIGN (Architect Agent)
        design = await self._delegate_to_agent("architect", f"Design the structural implementation for this plan: {plan}")
        logger.info("Architectural Design phase complete.")

        # 3. IMPLEMENT & CRITIQUE LOOP (Implementer + Critic)
        # We instruct the implementer to use a multi-file JSON format if the objective is complex
        implementer_prompt = (
            f"Execute this design: {design}. "
            "IMPORTANT: If the project requires multiple files, return a JSON object with filenames as keys "
            "and file content as values. Otherwise, return the code directly."
        )
        implementation = await self._delegate_to_agent("implementer", implementer_prompt)
        
        critique = await self._delegate_to_agent("critic", f"Perform security and logic review of: {implementation}")
        
        # 4. OPTIMIZE (Optimizer Agent)
        optimization = await self._delegate_to_agent("optimizer", f"Optimize this implementation based on critique: {implementation}\nCritique: {critique}")
        
        # 5. AUDIT (Auditor Agent)
        audit_prompt = (
            f"Verify and audit the following optimized solution: {optimization}. "
            "Ensure the final output is finalized. If it's a multi-file project, ensure the JSON is valid."
        )
        audit_result = await self._delegate_to_agent("auditor", audit_prompt)
        
        logger.info("Swarm objective cycle finalized.")
        
        # Attempt to parse as multi-file JSON
        try:
            import json
            # Extract JSON if wrapped in markdown
            temp_result = audit_result.strip()
            if temp_result.startswith("```json"):
                temp_result = temp_result[7:-3].strip()
            elif temp_result.startswith("{"):
                pass # Already looks like JSON
            
            data = json.loads(temp_result)
            if isinstance(data, dict) and len(data) > 0:
                return {
                    "is_multifile": True,
                    "file_map": data,
                    "content": audit_result # Keep raw for reference
                }
        except:
            pass

        # Fallback to single file
        return {
            "is_multifile": False,
            "content": audit_result,
            "file_map": {}
        }

    async def _delegate_to_agent(self, agent_key: str, prompt: str) -> str:
        """
        Routes a subtask to a specific specialized agent.
        """
        agent = self.active_agents.get(agent_key)
        if not agent:
            raise ValueError(f"Agent profile {agent_key} not found in registry.")

        logger.debug(f"Delegating to {agent.name} (Role: {agent.role})...")
        
        # We wrap the reasoning request with the agent's specific persona
        response = await self.reasoning.generate_response(
            system_prompt=agent.system_prompt,
            user_prompt=prompt,
            temperature=0.2 # Higher consistency across swarm
        )
        
        return response

class consensus_resolution:
    """
    Placeholder for the Conflict Resolution Layer.
    Calculates weighted confidence scores for multiple agent outputs.
    """
    @staticmethod
    def resolve(proposals: List[Dict[str, Any]]) -> Dict[str, Any]:
        return max(proposals, key=lambda x: x.get('confidence', 0))
