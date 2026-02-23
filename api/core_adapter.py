"""
Decoupling Layer for Ascension Platform.
Wraps core intelligence components to prevent direct HTTP/Platform coupling.
"""
from typing import AsyncGenerator
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
        
        # Simplified streaming simulation for this tier
        yield f"data: {json.dumps({'status': 'PLANNING', 'message': 'Swarm calibrating for objective...'})}\n\n"
        await self.cognition.swarm.execute_swarm_objective(objective)
        yield f"data: {json.dumps({'status': 'COMPLETED', 'message': 'Objective achieved by swarm.'})}\n\n"

    async def execute_direct(self, objective: str) -> str:
        """
        Standard non-streaming execution.
        """
        return await self.cognition.swarm.execute_swarm_objective(objective)
