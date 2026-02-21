"""
Long Term Memory hub.
Integrates the VectorStore and MemoryIndexer for the cognitive layer.
"""
from typing import List, Dict, Any
from core.reasoning_engine import ReasoningEngine
from memory.vector_store import VectorStore
from memory.memory_indexer import MemoryIndexer, MemorySummary
from utils.logger import logger

class LongTermMemory:
    """
    Front-facing API for the cognitive and learning layers to store and retrieve
    semantic experiences and learned facts.
    """

    def __init__(self, vector_store: VectorStore, indexer: MemoryIndexer):
        self.vector_store = vector_store
        self.indexer = indexer
        logger.info("LongTermMemory operational.")

    async def store_episode(self, episode_data: List[Dict[str, Any]]) -> None:
        """
        Takes raw short-term memory, compresses it into a fact, and embeds it.
        """
        # 1. Compress raw data via LLM
        summary: MemorySummary = await self.indexer.compress_episode(episode_data)
        
        # 2. Stringify for embedding
        embedding_text = f"Resource: {summary.core_topic}\nFact: {summary.compressed_fact}"
        logger.debug(f"Storing into LTM: {embedding_text}")

        # 3. Store in FAISS
        await self.vector_store.store(
            text=embedding_text,
            meta={
                "topic": summary.core_topic,
                "tags": summary.tags,
                "raw_fact": summary.compressed_fact
            }
        )
        logger.info(f"Successfully consolidated episode into LTM under topic: {summary.core_topic}")

    async def retrieve_relevant_context(self, current_task_description: str, top_k: int = 3) -> str:
        """
        Queries the vector store for facts semantically similar to the current task.
        
        Returns:
            A formatted string of relevant past experiences for the planner or decision engine.
        """
        logger.debug(f"Querying LTM for task: {current_task_description[:30]}...")
        results = await self.vector_store.search(query=current_task_description, k=top_k)
        
        if not results:
            return "No relevant past experiences found."

        context_lines = ["--- PAST RELEVANT EXPERIENCES ---"]
        for distance, meta in results:
            # lower distance = more similar in FAISS L2
            context_lines.append(f"- [{meta.get('topic')}] {meta.get('raw_fact')} (dist: {distance:.2f})")
            
        return "\n".join(context_lines)
