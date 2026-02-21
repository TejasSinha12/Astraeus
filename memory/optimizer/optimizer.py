"""
Nightly/Offline worker to prune degraded or useless memories from the VectorStore.
"""
from typing import List, Dict
import os
import json
import faiss

from memory.vector_store import VectorStore
from metrics.db_schema import SessionLocal, MemoryTelemetry
from core_config import config
from utils.logger import logger

class MemoryOptimizer:
    """
    Analyzes the SQL Telemetry database for memory access patterns.
    If a memory is retrieved constantly but correlates with Task Failure,
    it is extracted from the FAISS index to prevent "hallucination loops".
    """

    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        logger.info("MemoryOptimizer bound to local VectorStore.")

    def run_optimization_cycle(self, usefulness_threshold: float = 0.2, min_hits: int = 5) -> int:
        """
        Scans all telemetry. Purges items that meet the criteria.
        
        Returns:
            int: The number of vectors purged from FAISS.
        """
        logger.info(f"Starting memory optimization cycle (T={usefulness_threshold}, Hits>={min_hits})")
        
        purge_list = []
        with SessionLocal() as db:
            candidates = db.query(MemoryTelemetry).filter(MemoryTelemetry.retrieval_count >= min_hits).all()
            for cand in candidates:
                if cand.usefulness_score <= usefulness_threshold:
                    purge_list.append(cand.memory_id)
                    logger.warning(f"Memory [ID={cand.memory_id}] flagged for purge. Usefulness: {cand.usefulness_score:.2f}")

        if not purge_list:
            logger.info("Memory index is healthy. No items to purge.")
            return 0

        purged_count = self._purge_from_faiss(purge_list)
        logger.info(f"Optimization complete. {purged_count} degraded memories permanently removed.")
        return purged_count

    def _purge_from_faiss(self, target_topics: List[str]) -> int:
        """
        FAISS doesn't easily support deletion by ID without maintaining a complex IDMap.
        For V1, we rebuild the index excluding the banned topics.
        """
        original_count = len(self.vector_store.metadata)
        
        # 1. Filter metadata
        kept_metadata = []
        kept_indices = []
        
        for idx, meta in enumerate(self.vector_store.metadata):
             # We assume memory_id maps to 'topic' or 'raw_fact' hash in our system
            topic_hash = str(hash(meta.get("topic", "")))
            if topic_hash not in target_topics:
                kept_metadata.append(meta)
                kept_indices.append(idx)

        # 2. Rebuild index if anything changed
        if len(kept_metadata) == original_count:
            return 0
            
        logger.info(f"Rebuilding FAISS index. Shrinking {original_count} -> {len(kept_metadata)}")
        
        # Extract kept vectors
        new_index = faiss.IndexFlatL2(self.vector_store.dimension)
        if kept_indices:
             # This is a bit computationally heavy but fine for a "Nightly" job.
            vectors_to_keep = [self.vector_store.index.reconstruct(i) for i in kept_indices]
            for vec in vectors_to_keep:
                new_index.add(vec.reshape(1, -1)) # Reshape for FAISS expected insertion

        # 3. Apply changes and save
        self.vector_store.index = new_index
        self.vector_store.metadata = kept_metadata
        self.vector_store.save()
        
        return original_count - len(kept_metadata)
