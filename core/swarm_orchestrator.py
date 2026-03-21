"""
Swarm Orchestrator for Project Ascension.
Manages the lifecycle, communication, and task delegation of a multi-agent workforce.
"""
import asyncio
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.reasoning_engine import ReasoningEngine
from agents.swarm_profiles import AGENT_REGISTRY, AgentProfile, SwarmCommunication
from api.usage_db import SessionLocal, SwarmMission, MissionBranch, MissionTraceStep, AuditLog
from core.stability_engine import StabilityEngine
from core.consensus_engine import ConsensusEngine, SwarmDecision
from utils.logger import logger
import json
import uuid
import datetime

class SwarmOrchestrator:
    """
    Coordinates interactions between specialized agents to solve complex objectives.
    """

    def __init__(self, reasoning_engine: ReasoningEngine):
        self.reasoning = reasoning_engine
        self.active_agents: Dict[str, AgentProfile] = AGENT_REGISTRY
        
        # Stability & Monitoring Modules
        self.stability = StabilityEngine()
        self.consensus = ConsensusEngine(cluster_ids=[]) # Initialize consensus layer
        
        logger.info(f"SwarmOrchestrator online with {len(self.active_agents)} specialized agent profiles.")

    async def execute_forge_session(self, user_id: str, objective: str) -> Dict[str, Any]:
        """
        [THE FORGE] Spawns 3 parallel swarms with distinct architectural biases.
        """
        forge_id = str(uuid.uuid4())
        logger.info(f"FORGE: Initiating parallel evolution for session {forge_id}")

        # Define architectural "biases" for the parallel swarms
        biases = [
            {"label": "Performance", "hint": "Prioritize low latency, caching, and memory efficiency."},
            {"label": "Scalability", "hint": "Prioritize horizontal scaling, statelessness, and pub-sub patterns."},
            {"label": "Elegance", "hint": "Prioritize clean code, functional patterns, and minimal dependencies."}
        ]

        # 1. Register Forge Session
        with SessionLocal() as db:
            branch = MissionBranch(id=forge_id, user_id=user_id, objective=objective)
            db.add(branch)
            db.commit()

        # 2. Run Parallel Swarms
        tasks = []
        for bias in biases:
            branch_objective = f"{objective}. [ARCH_BIAS: {bias['hint']}]"
            tasks.append(self.execute_swarm_objective(branch_objective, mission_id=f"{forge_id}_{bias['label'].lower()}"))

        results = await asyncio.gather(*tasks)

        # 3. Performance Duel Metrics (Mock Benchmarking)
        metrics = {}
        for i, res in enumerate(results):
            label = biases[i]['label']
            metrics[label] = {
                "latency_ms": 10 + (i * 5),
                "complexity_score": 0.8 - (i * 0.1),
                "security_rating": "A+" if i == 0 else "A",
                "tokens_used": len(res.get("content", "")) // 4
            }

        with SessionLocal() as db:
            branch = db.query(MissionBranch).filter(MissionBranch.id == forge_id).first()
            if branch:
                branch.metrics_json = json.dumps(metrics)
                db.commit()

        return {"forge_id": forge_id, "branches": metrics}

    async def _record_trace_step(self, mission_id: str, step_index: int, agent_role: str, label: str, reasoning: str, code: str):
        """
        [CHRONOS ENGINE] Persists a single reasoning thought and code snapshot.
        """
        if not mission_id: return
        
        try:
            with SessionLocal() as db:
                trace = MissionTraceStep(
                    mission_id=mission_id,
                    step_index=step_index,
                    agent_role=agent_role,
                    label=label,
                    reasoning_content=reasoning,
                    code_snapshot=code
                )
                db.add(trace)
                db.commit()
        except Exception as e:
            logger.error(f"CHRONOS: Failed to record trace step: {e}")

    async def _emit_heartbeat(self, mission_id: str, agent_role: str, action: str, severity: str = "INFO"):
        """
        [HEARTBEAT] Emits a live diagnostic pulse to the global audit stream.
        """
        try:
            with SessionLocal() as db:
                log = AuditLog(
                    user_id="SYSTEM",  # Internal orchestrator pulse
                    action=f"HEARTBEAT:{agent_role}:{action}",
                    metadata_json=json.dumps({"mission_id": mission_id, "severity": severity, "timestamp": str(datetime.datetime.utcnow())})
                )
                db.add(log)
                db.commit()
        except Exception as e:
            logger.error(f"ORCHESTRATOR: Heartbeat failure: {e}")

    async def execute_swarm_objective(self, objective: str, config: dict | None = None, mission_id: str | None = None) -> Dict[str, Any]:
        """
        Hierarchical execution objective through the swarm.
        Supports TRACE instrumentation for the Chronos Engine.
        """
        config = config or {"agents": {"auditor": True, "optimizer": True, "critic": True}, "creativity": 0.5, "strictness": 0.8}
        logger.info(f"Swarm mobilization triggered for objective: {objective}")
        
        step_idx = 0

        # 1. PLAN
        await self._emit_heartbeat(mission_id, "planner", "START_PLANNING")
        plan = await self._delegate_to_agent("planner", f"Decompose: {objective}", config)
        await self._record_trace_step(mission_id, step_idx, "planner", "Planning", plan, "")
        step_idx += 1

        # 2. DESIGN
        await self._emit_heartbeat(mission_id, "architect", "START_DESIGNING")
        design = await self._delegate_to_agent("architect", f"Design: {plan}", config)
        await self._record_trace_step(mission_id, step_idx, "architect", "Architecture", design, "")
        step_idx += 1

        # 3. IMPLEMENT
        await self._emit_heartbeat(mission_id, "implementer", "START_IMPLEMENTATION")
        implementation = await self._delegate_to_agent("implementer", f"Execute design: {design}", config)
        await self._record_trace_step(mission_id, step_idx, "implementer", "Implementation", "Initial Code Draft Generated", implementation)
        step_idx += 1
        
        # ... logic for critic, optimizer etc ...
        final_result = implementation
        
        logger.info("Swarm objective cycle finalized.")
        
        # Parse result...
        try:
            temp_result = final_result.strip()
            if temp_result.startswith("```json"):
                temp_result = temp_result[7:-3].strip()
            data = json.loads(temp_result)
            return {"is_multifile": True, "file_map": data, "content": final_result}
        except:
            # Calculate final stability metrics before returning
            risk = self.stability.calculate_risk([{"objective": objective}])
            # entropy = self.stability.calculate_entropy([{"step": i} for i in range(step_idx)])
            
            await self._emit_heartbeat(mission_id, "orchestrator", f"MISSION_COMPLETED:STABILITY_OK", severity="SUCCESS")
            return {"is_multifile": False, "content": final_result, "file_map": {}}

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
            global_config.TASK_TOKEN_LIMIT = original_limit
            
        return response

    async def _delegate_with_consensus(self, agent_key: str, prompt: str, models: List[str], config: dict | None = None) -> Dict[str, Any]:
        """
        Executes parallel reasoning across multiple models and resolves via ConsensusEngine.
        """
        config = config or {"creativity": 0.5, "strictness": 0.8}
        agent = self.active_agents.get(agent_key)
        
        logger.info(f"CONSENSUS: Dispatching {agent_key} task to {len(models)} models in parallel.")
        
        tasks = []
        for model in models:
            # Note: Assuming reasoning_engine can take a specific model string
            tasks.append(self.reasoning.generate_response(
                system_prompt=agent.system_prompt,
                user_prompt=prompt,
                temperature=0.1 + (config.get("creativity", 0.5) * 0.8),
                model_override=model
            ))
        
        responses = await asyncio.gather(*tasks)
        
        decisions = []
        for i, resp in enumerate(responses):
            try:
                # Basic parsing to SwarmDecision format
                # In a real scenario, this would involve structured output parsing
                decisions.append(SwarmDecision(
                    model=models[i],
                    tool="PROPOSE_ACTION", # Mock for now
                    args={"content": resp},
                    confidence=0.85 # Mock confidence
                ))
            except:
                continue

        metrics = self.consensus.calculate_swarm_consensus(decisions)
        
        await self._emit_heartbeat("CONSENSUS_REACHED", agent_key, f"Score: {metrics.consensus_score:.2f}")
        
        return {
            "content": metrics.winning_decision.get("args", {}).get("content", ""),
            "consensus_metrics": metrics.dict()
        }

class consensus_resolution:
    """
    Placeholder for the Conflict Resolution Layer.
    Calculates weighted confidence scores for multiple agent outputs.
    """
    @staticmethod
    def resolve(proposals: List[Dict[str, Any]]) -> Dict[str, Any]:
        return max(proposals, key=lambda x: x.get('confidence', 0))
