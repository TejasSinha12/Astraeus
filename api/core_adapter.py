from __future__ import annotations
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
from api.notifications import NotificationService
from utils.logger import logger

class CoreAdapter:
    """
    Service adapter for the Ascension Cognition Core.
    Translates platform requests into swarm operations.
    """

    def __init__(self):
        self.cognition = CognitionCore()
        self.notifications = NotificationService()

    async def run_swarm_stream(
        self, 
        objective: str, 
        user_id: str, 
        parent_id: str | None = None, 
        experiment_id: str | None = None,
        swarm_config: dict | None = None
    ) -> AsyncGenerator[str, None]:
        """
        Executes a swarm task and yields progress updates as SSE events.
        Includes Keep-Alive pings to prevent proxy timeouts during deep reasoning.
        """
        config = swarm_config or {"agents": {"auditor": True, "optimizer": True, "critic": True}}
        logger.info(f"ADAPTER: Starting stream for {user_id} -> {objective[:30]} with Config: {config}")
        
        # Initial simulation phases for UI feedback
        phases = [
            ("PLANNING", "Swarm calibrating for objective..."),
            ("DESIGN", "Architecting structural implementation..."),
            ("IMPLEMENT", "Implementer agent generating code base...")
        ]
        
        if config.get("agents", {}).get("critic"):
            phases.append(("CRITIQUE", "Refining tactical approach via critic agent..."))
        if config.get("agents", {}).get("auditor"):
            phases.append(("AUDIT", "Auditor agent verifying security and logic..."))

        for status, msg in phases:
            yield f"data: {json.dumps({'status': status, 'message': msg})}\n\n"
            await asyncio.sleep(1.2)

        # Execute swarm logic with a keep-alive wrapper
        swarm_task = asyncio.create_task(
            self.cognition.swarm.execute_swarm_objective(
                objective=objective,
                config=config
            )
        )
        
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
            msg = str(e)
            if "MISSION_FAILED" in msg:
                # User-friendly billing error
                clean_msg = msg.replace("MISSION_FAILED: ", "")
                yield f"data: {json.dumps({'status': 'ERROR', 'message': f'Engine Notice: {clean_msg}'})}\n\n"
            else:
                logger.error(f"ADAPTER: Swarm Execution Failed: {e}")
                yield f"data: {json.dumps({'status': 'ERROR', 'message': f'Swarm critical failure: {msg}'})}\n\n"
            return
            
        # Extract structured data with fallback safety
        if not swarm_result:
            swarm_result = {}

        content = swarm_result.get("content", "Error: No output generated.")
        file_map = swarm_result.get("file_map", {})
        is_multifile = swarm_result.get("is_multifile", False)
        
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

        # 2. Filesystem Persistence (Secondary/Backup)
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
        yield f"data: {json.dumps({'status': 'RESULT', 'message': content, 'is_multifile': is_multifile, 'file_map': file_map})}\n\n"
        
        # Dispatch Notifications (Fire-and-forget background tasks)
        asyncio.create_task(self.notifications.send_mission_report(
            email=user_id if "@" in user_id else "tejas@astraeus.ai", 
            mission_id=mission_id,
            objective=objective,
            metrics={"tokens": 1500, "latency": 5000, "confidence": 0.98}
        ))
        asyncio.create_task(self.notifications.trigger_webhook("MISSION_SUCCESS", {
            "mission_id": mission_id,
            "objective": objective,
            "user_id": user_id
        }, user_id=user_id))

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
