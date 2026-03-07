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
        
        # Meta-Evolutionary Modules
        from core.agent_spawner import AgentSpawner
        self.spawner = AgentSpawner(reasoning_engine)
        
        logger.info(f"SwarmOrchestrator online with {len(self.active_agents)} specialized agent profiles.")

    async def execute_swarm_objective(self, objective: str, config: dict | None = None) -> Dict[str, Any]:
        """
        Hierarchical execution objective through the swarm.
        Returns a structured result: {"content": str, "is_multifile": bool, "file_map": dict}
        """
        config = config or {"agents": {"auditor": True, "optimizer": True, "critic": True}, "creativity": 0.5, "strictness": 0.8}
        logger.info(f"Swarm mobilization triggered for objective: {objective} (Config: {config})")

        # 1. PLAN (Planner Agent)
        plan = await self._delegate_to_agent("planner", f"Decompose this objective into a DAG: {objective}", config)
        logger.info("Swarm Plan phase complete.")

        # 2. DESIGN (Architect Agent)
        design = await self._delegate_to_agent("architect", f"Design the structural implementation for this plan: {plan}", config)
        logger.info("Architectural Design phase complete.")

        # 3. IMPLEMENT & CRITIQUE LOOP (Implementer + Critic)
        implementer_prompt = (
            f"Execute this design: {design}. "
            "IMPORTANT: If the project requires multiple files, return a JSON object with filenames as keys "
            "and file content as values. Otherwise, return the code directly."
        )
        implementation = await self._delegate_to_agent("implementer", implementer_prompt, config)
        
        # Optional Agents based on config
        critique = ""
        if config["agents"].get("critic"):
            critique = await self._delegate_to_agent("critic", f"Perform security and logic review of: {implementation}", config)
        
        # 4. OPTIMIZE (Optimizer Agent)
        optimization = implementation
        if config["agents"].get("optimizer"):
            optimization = await self._delegate_to_agent("optimizer", f"Optimize this implementation based on critique: {implementation}\nCritique: {critique}", config)
        
        # 5. AUDIT (Auditor Agent)
        final_result = optimization
        if config["agents"].get("auditor"):
            audit_prompt = (
                f"Verify and audit the following optimized solution: {optimization}. "
                "Ensure the final output is finalized. If it's a multi-file project, ensure the JSON is valid."
            )
            final_result = await self._delegate_to_agent("auditor", audit_prompt, config)
        
        logger.info("Swarm objective cycle finalized.")
        
        # Attempt to parse as multi-file JSON
        try:
            import json
            temp_result = final_result.strip()
            if temp_result.startswith("```json"):
                temp_result = temp_result[7:-3].strip()
            elif temp_result.startswith("{"):
                pass 
            
            data = json.loads(temp_result)
            if isinstance(data, dict) and len(data) > 0:
                return {
                    "is_multifile": True,
                    "file_map": data,
                    "content": final_result 
                }
        except:
            pass

        # Fallback to single file
        return {
            "is_multifile": False,
            "content": final_result,
            "file_map": {}
        }

    async def recursive_optimize(self, mission_telemetry: List[Dict[str, Any]]):
        """
        Self-modification hook. Analyzes past telemetry to propose improvements
        to the swarm's own communication topology and agent hierarchy.
        """
        logger.info("ORCHESTRATOR: Initiating Recursive Cognitive Optimization...")
        
        # We use the Planner to reflect on the performance of the swarm
        reflection_prompt = (
            f"Review the following mission telemetry: {mission_telemetry}\n"
            "Identify structural inefficiencies in the current swarm DAG. "
            "Propose a more efficient delegation topology or new specialized roles."
        )
        
        proposal = await self._delegate_to_agent("planner", reflection_prompt)
        logger.info(f"Recursive Proposal Generated: {proposal[:100]}...")
        
        # Integrate with MetaGovernance for authorization
        return proposal

    async def _delegate_to_agent(self, agent_key: str, prompt: str, config: dict | None = None) -> str:
        """
        Routes a subtask to a specific specialized agent.
        """
        from core_config import config as global_config
        config = config or {"creativity": 0.5, "strictness": 0.8}
        
        agent = self.active_agents.get(agent_key)
        if not agent:
            # Check if we can autonomously spawn a missing specialist
            logger.warning(f"ORCHESTRATOR: Agent {agent_key} not found. Attempting BIOSYNTHESIS...")
            new_agent = await self.spawner.biosynthesize_specialist("Generic Task", f"Missing agent profile for key: {agent_key}")
            if new_agent:
                agent = new_agent
            else:
                raise ValueError(f"Agent profile {agent_key} not found and synthesis failed.")

        logger.debug(f"Delegating to {agent.name} (Role: {agent.role})...")
        
        # Override the global task limit with the agent's independent heavy-duty budget
        original_limit = global_config.TASK_TOKEN_LIMIT
        global_config.TASK_TOKEN_LIMIT = agent.independent_token_budget
        self.reasoning.tokens.reset_task_usage()
        
        try:
            # Adjust temperature based on creativity (creativity 0..1 -> temp 0.1..0.9)
            temp = 0.1 + (config.get("creativity", 0.5) * 0.8)

            # We wrap the reasoning request with the agent's specific persona
            response = await self.reasoning.generate_response(
                system_prompt=agent.system_prompt,
                user_prompt=prompt,
                temperature=temp 
            )
            
            # Bottleneck Detection Logic
            if "REASONING_FRAGMENTED" in response:
                logger.warning("ORCHESTRATOR: Reasoning bottleneck detected. Spawning specialist...")
                await self.spawner.biosynthesize_specialist(prompt, "Output indicated reasoning fragmentation.")
                
        finally:
            config.TASK_TOKEN_LIMIT = original_limit
            
        return response

class consensus_resolution:
    """
    Placeholder for the Conflict Resolution Layer.
    Calculates weighted confidence scores for multiple agent outputs.
    """
    @staticmethod
    def resolve(proposals: List[Dict[str, Any]]) -> Dict[str, Any]:
        return max(proposals, key=lambda x: x.get('confidence', 0))
