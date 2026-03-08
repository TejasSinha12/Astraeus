"""
REST Interface for The Forge and Chronos Engine.
Exposes parallel branching and time-indexed reasoning traces.
"""
from fastapi import APIRouter, Header, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from core.swarm_orchestrator import SwarmOrchestrator
from core.reasoning_engine import ReasoningEngine
from api.usage_db import SessionLocal, MissionBranch, SwarmMission, MissionTraceStep
from utils.logger import logger

router = APIRouter(prefix="/forge", tags=["The Forge"])
reasoning = ReasoningEngine()
orchestrator = SwarmOrchestrator(reasoning)

class ForgeRequest(BaseModel):
    objective: str

@router.post("/session")
async def start_forge_session(request: ForgeRequest, x_clerk_user_id: str = Header(...)):
    """
    Initiates a 3-way parallel evolution for a single coding objective.
    """
    try:
        result = await orchestrator.execute_forge_session(x_clerk_user_id, request.objective)
        return result
    except Exception as e:
        logger.error(f"FORGE API ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session/{forge_id}")
async def get_forge_status(forge_id: str):
    """
    Retrieves the benchmarking results and mission links for a forge session.
    """
    with SessionLocal() as db:
        branch = db.query(MissionBranch).filter(MissionBranch.id == forge_id).first()
        if not branch:
            raise HTTPException(status_code=404, detail="Forge session not found.")
        
        # Also find the missions linked to this forge (using the forge_id prefix)
        import json
        return {
            "forge_id": forge_id,
            "objective": branch.objective,
            "metrics": json.loads(branch.metrics_json) if branch.metrics_json else {},
            "created_at": branch.created_at
        }

@router.get("/trace/{mission_id}")
async def get_mission_trace(mission_id: str):
    """
    [CHRONOS ENGINE] Returns all time-indexed reasoning steps for a mission.
    """
    with SessionLocal() as db:
        traces = db.query(MissionTraceStep).filter(MissionTraceStep.mission_id == mission_id).order_by(MissionTraceStep.step_index.asc()).all()
        return [
            {
                "step": t.step_index,
                "role": t.agent_role,
                "label": t.label,
                "content": t.reasoning_content,
                "code": t.code_snapshot,
                "timestamp": t.timestamp
            }
            for t in traces
        ]
