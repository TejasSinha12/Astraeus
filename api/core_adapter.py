"""
Decoupling Layer for Ascension Platform.
Wraps core intelligence components to prevent direct HTTP/Platform coupling.
"""
from typing import AsyncGenerator, Optional
from pathlib import Path
import asyncio
import json
import uuid
import time

from core.cognition import CognitionCore
from api.usage_db import SessionLocal, SwarmMission
from utils.logger import logger

class CoreAdapter:
    """
    Service adapter for the Ascension Cognition Core.
    Translates platform requests into swarm operations.
    """

    def __init__(self):
        self.cognition = CognitionCore()

    async def run_swarm_stream(self, objective: str, user_id: str, parent_id: Optional[str] = None, experiment_id: Optional[str] = None) -> AsyncGenerator[str, None]:
        """
        Executes a swarm task and yields progress updates as SSE events.
        Includes Keep-Alive pings to prevent proxy timeouts during deep reasoning.
        """
        logger.info(f"ADAPTER: Starting stream for {user_id} -> {objective[:30]}...")
        
        # Initial simulation phases for UI feedback
        phases = [
            ("PLANNING", "Swarm calibrating for objective..."),
            ("DESIGN", "Architecting structural implementation..."),
            ("IMPLEMENT", "Implementer agent generating code base..."),
            ("AUDIT", "Auditor agent verifying security and logic...")
        ]

        for status, msg in phases:
            yield f"data: {json.dumps({'status': status, 'message': msg})}\n\n"
            await asyncio.sleep(1.2)

        # Execute swarm logic with a keep-alive wrapper
        swarm_task = asyncio.create_task(self.cognition.swarm.execute_swarm_objective(objective))
        
        while not swarm_task.done():
            # Yield Keep-Alive ping to prevent 30s timeouts on Render/Vercel
            yield f"data: {json.dumps({'status': 'PROCESSING', 'message': 'Swarm thinking...'})}\n\n"
            try:
                # Wait for task or timeout for the next ping
                await asyncio.wait_for(asyncio.shield(swarm_task), timeout=5.0)
            except asyncio.TimeoutError:
                continue
            except Exception:
                # Task raised an exception, done() will be true, we handle it below
                break

        try:
            swarm_result = await swarm_task
        except Exception as e:
            logger.error(f"ADAPTER: Swarm Execution Failed: {e}")
            yield f"data: {json.dumps({'status': 'ERROR', 'message': f'Swarm critical failure: {str(e)}'})}\n\n"
            return
            
        # Extract structured data
        content = swarm_result.get("content", "") if swarm_result else ""
        file_map = swarm_result.get("file_map", {}) if swarm_result else {}
        is_multifile = swarm_result.get("is_multifile", False) if swarm_result else False
        
        # PERSISTENCE LAYER: Save the generated codebase to the mission sandbox
        mission_id = str(uuid.uuid4())[:8]
        
        # 1. Database Persistence (Primary for Production)
        file_ext = "html" if "<html" in content.lower() else "txt"
        filename = f"mission_result.{file_ext}"
        
        try:
            with SessionLocal() as db:
                mission = SwarmMission(
                    id=mission_id,
                    user_id=user_id,
                    parent_id=parent_id,
                    experiment_id=experiment_id,
                    objective=objective,
                    source_code=content,
                    filename=filename,
                    is_multifile=is_multifile,
                    file_map=json.dumps(file_map) if is_multifile else None
                )
                db.add(mission)
                db.commit()
                logger.info(f"ADAPTER: Mission {mission_id} persisted to DATABASE (Multi-file: {is_multifile}).")
        except Exception as e:
            logger.error(f"ADAPTER: Database persistence failed: {e}")

        # 2. Filesystem Persistence (Secondary/Backup - Single file only for simplicity)
        try:
            sandbox_path = Path("api/sandbox/missions") / mission_id
            sandbox_path.mkdir(parents=True, exist_ok=True)
            file_path = sandbox_path / filename
            with open(file_path, "w") as f:
                f.write(content)
            logger.info(f"ADAPTER: Mission {mission_id} persisted to FILESYSTEM: {file_path}")
        except Exception as e:
            logger.warning(f"ADAPTER: Filesystem persistence failed: {e}")

        # Yield the final code result
        yield f"data: {json.dumps({'status': 'RESULT', 'message': content, 'is_multifile': is_multifile})}\n\n"
        
        completion_data = {
            'status': 'COMPLETED', 
            'message': 'Mission complete. Tactical output ready.',
            'storage_path': f"DATABASE://{mission_id}",
            'is_multifile': is_multifile
        }
        yield f"data: {json.dumps(completion_data)}\n\n"

    async def execute_direct(self, objective: str) -> str:
        """
        Standard non-streaming execution.
        """
        return await self.cognition.swarm.execute_swarm_objective(objective)
