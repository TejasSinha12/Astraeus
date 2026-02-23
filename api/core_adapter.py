"""
Decoupling Layer for Ascension Platform.
Wraps core intelligence components to prevent direct HTTP/Platform coupling.
"""
from typing import AsyncGenerator
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

    async def run_swarm_stream(self, objective: str, user_id: str) -> AsyncGenerator[str, None]:
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

        result = await swarm_task
        
        # PERSISTENCE LAYER: Save the generated codebase to the mission sandbox
        mission_id = str(uuid.uuid4())[:8]
        
        # 1. Database Persistence (Primary for Production)
        file_ext = "html" if "<html" in result.lower() else "txt"
        filename = f"mission_result.{file_ext}"
        
        try:
            with SessionLocal() as db:
                mission = SwarmMission(
                    id=mission_id,
                    user_id=user_id,
                    objective=objective,
                    source_code=result,
                    filename=filename
                )
                db.add(mission)
                db.commit()
                logger.info(f"ADAPTER: Mission {mission_id} persisted to DATABASE.")
        except Exception as e:
            logger.error(f"ADAPTER: Database persistence failed: {e}")

        # 2. Filesystem Persistence (Secondary/Backup)
        try:
            sandbox_path = Path("api/sandbox/missions") / mission_id
            sandbox_path.mkdir(parents=True, exist_ok=True)
            file_path = sandbox_path / filename
            with open(file_path, "w") as f:
                f.write(result)
            logger.info(f"ADAPTER: Mission {mission_id} persisted to FILESYSTEM: {file_path}")
        except Exception as e:
            logger.warning(f"ADAPTER: Filesystem persistence failed (Expected on ephemeral hosts): {e}")

        # Yield the final code result
        yield f"data: {json.dumps({'status': 'RESULT', 'message': result})}\n\n"
        
        completion_data = {
            'status': 'COMPLETED', 
            'message': 'Mission complete. Tactical output ready.',
            'storage_path': f"DATABASE://{mission_id}"
        }
        yield f"data: {json.dumps(completion_data)}\n\n"

    async def execute_direct(self, objective: str) -> str:
        """
        Standard non-streaming execution.
        """
        return await self.cognition.swarm.execute_swarm_objective(objective)
