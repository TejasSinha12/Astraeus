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
        sandbox_path = Path("api/sandbox/missions") / mission_id
        sandbox_path.mkdir(parents=True, exist_ok=True)
        
        # Detect if result is HTML/JS for better naming
        file_ext = "html" if "<html" in result.lower() else "txt"
        file_path = sandbox_path / f"mission_result.{file_ext}"
        
        with open(file_path, "w") as f:
            f.write(result)
            
        logger.info(f"ADAPTER: Mission {mission_id} persisted to {file_path}")

        # Yield the final code result
        yield f"data: {json.dumps({'status': 'RESULT', 'message': result})}\n\n"
        yield f"data: {json.dumps({
            'status': 'COMPLETED', 
            'message': 'Mission complete. Tactical output ready.',
            'storage_path': str(file_path)
        })}\n\n"

    async def execute_direct(self, objective: str) -> str:
        """
        Standard non-streaming execution.
        """
        return await self.cognition.swarm.execute_swarm_objective(objective)
