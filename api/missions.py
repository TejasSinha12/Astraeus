from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import List, Dict, Any
import os

router = APIRouter(prefix="/missions", tags=["Missions"])

SANDBOX_DIR = Path("api/sandbox/missions")

@router.get("")
async def list_missions() -> List[Dict[str, Any]]:
    """
    Scans the sandbox directory and returns a list of persisted missions.
    """
    if not SANDBOX_DIR.exists():
        return []
    
    missions = []
    for mission_dir in SANDBOX_DIR.iterdir():
        if mission_dir.is_dir():
            # Get basic metadata from file stats
            stats = mission_dir.stat()
            
            # Find the result file
            results = list(mission_dir.glob("mission_result.*"))
            has_result = len(results) > 0
            
            missions.append({
                "id": mission_dir.name,
                "timestamp": stats.st_mtime,
                "has_result": has_result,
                "path": str(mission_dir)
            })
            
    # Sort by recent
    missions.sort(key=lambda x: x["timestamp"], reverse=True)
    return missions

@router.get("/{mission_id}/source")
async def get_mission_source(mission_id: str):
    """
    Returns the raw source code of a specific mission result.
    """
    mission_dir = SANDBOX_DIR / mission_id
    if not mission_dir.exists():
        raise HTTPException(status_code=404, detail="Mission not found.")
    
    results = list(mission_dir.glob("mission_result.*"))
    if not results:
        raise HTTPException(status_code=404, detail="No source code found for this mission.")
    
    source_file = results[0]
    with open(source_file, "r") as f:
        content = f.read()
        
    return {
        "id": mission_id,
        "filename": source_file.name,
        "content": content
    }
