from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any
import io
import zipfile
import json
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
                    "has_result": bool(m.source_code or m.file_map),
                    "objective": m.objective,
                    "is_multifile": m.is_multifile
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
            
            # For multi-file, we return the map
            if mission.is_multifile:
                return {
                    "id": mission.id,
                    "is_multifile": True,
                    "file_map": json.loads(mission.file_map) if m.file_map else {}
                }

            return {
                "id": mission.id,
                "is_multifile": False,
                "filename": mission.filename or "mission_result.code",
                "content": mission.source_code
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API: Failed to retrieve mission source: {e}")
        raise HTTPException(status_code=500, detail="Internal server error retrieving artifact.")

@router.get("/{mission_id}/export")
async def export_mission_zip(mission_id: str):
    """
    Bundles the mission artifacts into a ZIP archive and streams it to the client.
    """
    try:
        with SessionLocal() as db:
            mission = db.query(SwarmMission).filter(SwarmMission.id == mission_id).first()
            if not mission:
                raise HTTPException(status_code=404, detail="Mission not found.")

            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
                if mission.is_multifile and mission.file_map:
                    file_map = json.loads(mission.file_map)
                    for path, content in file_map.items():
                        zip_file.writestr(path, content)
                else:
                    filename = mission.filename or "mission_result.txt"
                    zip_file.writestr(filename, mission.source_code or "")

            zip_buffer.seek(0)
            return StreamingResponse(
                zip_buffer,
                media_type="application/x-zip-compressed",
                headers={"Content-Disposition": f"attachment; filename=mission_{mission_id}.zip"}
            )
@router.get("/lineage")
async def get_evolution_lineage() -> List[Dict[str, Any]]:
    """
    Returns a global map of mission parent-child relationships for genealogy visualization.
    """
    try:
        with SessionLocal() as db:
            missions = db.query(SwarmMission).all()
            return [
                {
                    "id": m.id,
                    "parent_id": m.parent_id,
                    "experiment_id": m.experiment_id,
                    "objective": m.objective[:50],
                    "timestamp": m.timestamp.timestamp()
                } for m in missions
            ]
    except Exception as e:
        logger.error(f"API: Failed to fetch lineage: {e}")
        return []
