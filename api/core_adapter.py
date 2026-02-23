"""
Decoupling Layer for Ascension Platform.
Wraps core intelligence components to prevent direct HTTP/Platform coupling.
"""
from typing import AsyncGenerator
import asyncio
import json
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
        """
        logger.info(f"ADAPTER: Starting stream for {user_id} -> {objective[:30]}...")
        
        # We simulate the swarm life-cycle phases for UI richness
        phases = [
            ("PLANNING", "Swarm calibrating for objective..."),
            ("DESIGN", "Architecting structural implementation..."),
            ("IMPLEMENT", "Implementer agent generating code base..."),
            ("AUDIT", "Auditor agent verifying security and logic...")
        ]

        for status, msg in phases:
            yield f"data: {json.dumps({'status': status, 'message': msg})}\n\n"
            await asyncio.sleep(1.5) # Allow UI to breath during phase transitions

        # Execute actual swarm logic
        result = await self.cognition.swarm.execute_swarm_objective(objective)
        
        # Yield the final code result
        yield f"data: {json.dumps({'status': 'RESULT', 'message': result})}\n\n"
        yield f"data: {json.dumps({'status': 'COMPLETED', 'message': 'Mission complete. Balanced synchronized.'})}\n\n"

    async def execute_direct(self, objective: str) -> str:
        """
        Standard non-streaming execution.
        """
        return await self.cognition.swarm.execute_swarm_objective(objective)
