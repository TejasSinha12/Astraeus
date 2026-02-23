from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import List, Dict, Any
import os

from api.usage_db import SessionLocal, SwarmMission
from utils.logger import logger

router = APIRouter(prefix="/missions", tags=["Missions"])

@router.get("")
async def list_missions() -> List[Dict[str, Any]]:
    """
    Returns a list of persisted missions from the database.
    """
    try:
        with SessionLocal() as db:
            missions = db.query(SwarmMission).order_by(SwarmMission.timestamp.desc()).all()
            return [
                {
                    "id": m.id,
                    "timestamp": m.timestamp.timestamp(),
                    "has_result": bool(m.source_code),
                    "objective": m.objective
                } for m in missions
            ]
    except Exception as e:
        logger.error(f"API: Failed to list missions: {e}")
        return []

@router.get("/{mission_id}/source")
async def get_mission_source(mission_id: str):
    """
    Returns the raw source code of a specific mission from the database.
    """
    try:
        with SessionLocal() as db:
            mission = db.query(SwarmMission).filter(SwarmMission.id == mission_id).first()
            if not mission:
                raise HTTPException(status_code=404, detail="Mission not found.")
            
            return {
                "id": mission.id,
                "filename": mission.filename or "mission_result.code",
                "content": mission.source_code
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API: Failed to retrieve mission source: {e}")
        raise HTTPException(status_code=500, detail="Internal server error retrieving artifact.")
