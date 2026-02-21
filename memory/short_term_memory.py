"""
Short Term Memory management for active context windows.
"""
from typing import List, Dict, Any
from pydantic import BaseModel
from collections import deque

from core_config import config
from utils.logger import logger

class MemoryEntry(BaseModel):
    role: str
    content: str
    metadata: Dict[str, Any] = {}

class ShortTermMemory:
    """
    Maintains ephemeral context using a rotating deque to prevent context window overflow.
    This holds the immediate "thoughts", observations, and recent tool outcomes.
    """

    def __init__(self, limit: int = config.SHORT_TERM_MEMORY_LIMIT):
        self.limit = limit
        self.buffer: deque[MemoryEntry] = deque(maxlen=limit)
        logger.debug(f"ShortTermMemory initialized with limit {limit}.")

    def add(self, role: str, content: str, **kwargs) -> None:
        """
        Pushes a new memory into the buffer. Drops the oldest if limit is hit.
        """
        entry = MemoryEntry(role=role, content=content, metadata=kwargs)
        self.buffer.append(entry)
        logger.debug(f"Added STM entry: [{role}] {content[:30]}...")

    def get_context_string(self) -> str:
        """
        Renders the active buffer into a string suitable for LLM context inclusion.
        """
        lines = []
        for entry in self.buffer:
            lines.append(f"{entry.role.upper()}: {entry.content}")
        return "\n".join(lines)

    def clear(self) -> None:
        """
        Flushes the current short term memory. Usually called when tasks complete.
        """
        self.buffer.clear()
        logger.debug("ShortTermMemory flushed.")
        
    def export_as_episode(self) -> List[Dict[str, Any]]:
        """
        Dumps the buffer for long-term serialization.
        """
        return [entry.model_dump() for entry in self.buffer]
