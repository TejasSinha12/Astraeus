"""
Memory Indexer for Long Term retention.
Compresess, formats, and clusters short-term episodes into semantically indexable strings.
"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field

from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class MemorySummary(BaseModel):
    """
    An extracted, compressed core fact or experience from an epoch.
    """
    core_topic: str = Field(description="The primary entity or functional area this memory relates to.")
    compressed_fact: str = Field(description="Concise, factual distillation of what was learned or experienced.")
    tags: List[str] = Field(description="Keywords for filtering. E.g. 'error', 'database', 'user_preference'.")

class MemoryIndexer:
    """
    Takes raw episode exports (lists of dicts) and uses the reasoning engine
    to compress them into hard facts before they are fed into the VectorStore.
    """

    def __init__(self, engine: ReasoningEngine):
        self.engine = engine
        logger.info("MemoryIndexer initialized.")

    async def compress_episode(self, episode_data: List[Dict[str, Any]]) -> MemorySummary:
        """
        Condenses a rambling interaction or task trace into a single high-value memory block.
        
        Args:
            episode_data: The list of dicts exported from ShortTermMemory.
            
        Returns:
            A MemorySummary structured factual object.
        """
        sys_prompt = (
            "You are the Memory Consolidation Engine for an AGI.\n"
            "Review the provided interaction logs and extract the absolute most important "
            "fact, rule, or learned outcome. Ignore conversational fluff. "
            "Focus on things that will help the AGI perform better in the future."
        )

        user_prompt = "Episode Log:\n"
        for entry in episode_data:
            user_prompt += f"{entry.get('role', 'System')}: {entry.get('content', '')}\n"

        logger.debug(f"Compressing episode of {len(episode_data)} turns...")
        summary = await self.engine.generate_response(
            system_prompt=sys_prompt,
            user_prompt=user_prompt,
            temperature=0.2,
            response_model=MemorySummary
        )
        
        logger.info(f"Episode compressed down to fact regarding: {summary.core_topic}")
        return summary
