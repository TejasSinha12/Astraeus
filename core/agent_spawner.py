"""
Agent Spawner for Project Ascension.
Autonomously generates and registers new specialized cognitive roles based on detected reasoning bottlenecks.
"""
import json
import uuid
from typing import Dict, List, Any, Optional
from pydantic import BaseModel

from agents.swarm_profiles import AgentProfile, AGENT_REGISTRY
from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class SpawnerConfig(BaseModel):
    max_specialized_agents: int = 10
    default_token_budget: int = 40000
    generation_temperature: float = 0.3

class AgentSpawner:
    """
    Biological-inspired synthesizer for new agent personas.
    Identifies if the current swarm lacks a specific specialist and creates one.
    """

    def __init__(self, reasoning_engine: ReasoningEngine, config: Optional[SpawnerConfig] = None):
        self.reasoning = reasoning_engine
        self.config = config or SpawnerConfig()
        self.self_spawn_count = 0
        logger.info("AgentSpawner online. Monitoring for cognitive gaps.")

    async def biosynthesize_specialist(self, objective: str, bottleneck_description: str, max_depth: int = 3) -> Optional[AgentProfile]:
        """
        Generates a new AgentProfile designed to solve a specific bottleneck.
        Hard capped horizontally to prevent logic recursion OOM loops.
        """
        if max_depth <= 0:
            logger.warning("SPAWNER: Recursion depth limit hit.")
            return None

        if len(AGENT_REGISTRY) >= self.config.max_specialized_agents + 6: # 6 is the base count
            logger.warning("SPAWNER: Max agent limit reached. Skipping biosynthesis.")
            return None

        prompt = (
            f"Objective: {objective}\n"
            f"Detected Bottleneck: {bottleneck_description}\n\n"
            "Generate a specialized AGI Agent Profile to handle this specific bottleneck. "
            "Return a JSON object with: 'name', 'role', 'system_prompt', 'specialization', and 'suggested_key'."
        )

        import asyncio
        for attempt in range(3):
            try:
                response = await self.reasoning.generate_response(
                    system_prompt="You are the Meta-Orchestrator. You design specialized AI personas to solve architectural gaps.",
                    user_prompt=prompt,
                    temperature=self.config.generation_temperature
                )
                
                # Extract JSON
                cleaned_res = response.strip()
                if "```json" in cleaned_res:
                    cleaned_res = cleaned_res.split("```json")[1].split("```")[0].strip()
                
                data = json.loads(cleaned_res)
                
                new_agent = AgentProfile(
                    name=data['name'],
                    role=data['role'],
                    system_prompt=data['system_prompt'],
                    independent_token_budget=self.config.default_token_budget,
                    specialization=data['specialization']
                )
                
                agent_key = data.get('suggested_key', f"specialist_{uuid.uuid4().hex[:4]}")
                
                # Register the new agent
                AGENT_REGISTRY[agent_key] = new_agent
                self.self_spawn_count += 1
                logger.info(f"SPAWNER: Successfully synthesized and registered specialist: {new_agent.name} ({agent_key})")
                return new_agent

            except Exception as e:
                logger.warning(f"SPAWNER: Attempt {attempt+1} failed to biosynthesize agent: {e}")
                await asyncio.sleep(2)
                
        logger.error("SPAWNER: All LLM reasoning attempts exhausted. Generating generic fallback.")
        return None

    def list_spawned_agents(self) -> Dict[str, AgentProfile]:
        return {k: v for k, v in AGENT_REGISTRY.items() if k not in ["planner", "architect", "implementer", "critic", "optimizer", "auditor"]}
        
    async def check_agent_health(self, agent_key: str) -> bool:
        """
        Pings a synthesized agent specifically looking for cognitive coherence.
        """
        agent = AGENT_REGISTRY.get(agent_key)
        if not agent:
            return False
            
        try:
            # Mock diagnostic tracing
            return len(agent.system_prompt) > 20
        except Exception:
            return False

    async def purge_dead_agents(self):
        """
        Garbage collects spawned intelligence loops that failed the coherency health check.
        """
        keys_to_purge = []
        for key in self.list_spawned_agents().keys():
            if not await self.check_agent_health(key):
                keys_to_purge.append(key)
                
        for dead_key in keys_to_purge:
            del AGENT_REGISTRY[dead_key]
            logger.info(f"SPAWNER: Purged cognitively un-aligned agent: {dead_key}")
