"""
Vector Store wrapper using FAISS.
Provides local fast semantic search capabilities.
"""
import os
import faiss
import numpy as np
import openai
from typing import List, Dict, Any, Tuple
import json

from core_config import config
from utils.logger import logger

class VectorStore:
    """
    Manages vector embeddings and provides fast similarity search.
    Currently hardcoded to use OpenAI embeddings and FAISS locally.
    """

    def __init__(self, dimension: int = 1536): # text-embedding-3-small dim
        """
        Initializes the FAISS index and the local metadata store.
        """
        self.dimension = dimension
        
        # Load or create index
        self.index_file = f"{config.MEMORY_INDEX_PATH}.faiss"
        self.meta_file = f"{config.MEMORY_INDEX_PATH}.json"
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(self.index_file), exist_ok=True)

        if os.path.exists(self.index_file) and os.path.exists(self.meta_file):
            self.index = faiss.read_index(self.index_file)
            with open(self.meta_file, 'r') as f:
                self.metadata: List[Dict[str, Any]] = json.load(f)
            logger.info(f"Loaded existing VectorStore with {self.index.ntotal} vectors.")
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []
            logger.info(f"Initialized empty VectorStore (dim={self.dimension}).")

        self.client = openai.AsyncOpenAI(api_key=config.OPENAI_API_KEY)

    async def get_embedding(self, text: str) -> List[float]:
        """
        Calls OpenAI to get the embedding vector for a string.
        """
        response = await self.client.embeddings.create(
            model=config.EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding

    async def store(self, text: str, meta: Dict[str, Any] = None) -> None:
        """
        Embeds and stores text along with associated metadata.
        """
        embedding = await self.get_embedding(text)
        vector = np.array([embedding]).astype('float32')
        
        self.index.add(vector)
        self.metadata.append(meta or {"text": text})
        
        self.save()

    async def search(self, query: str, k: int = 5) -> List[Tuple[float, Dict[str, Any]]]:
        """
        Embeds the query and fetches the top `k` similar items.
        
        Returns:
            List of tuples: (distance, metadata_dict).
        """
        if self.index.ntotal == 0:
            return []

        embedding = await self.get_embedding(query)
        vector = np.array([embedding]).astype('float32')
        
        distances, indices = self.index.search(vector, k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx == -1: continue # FAISS pads with -1 if not enough results
            results.append((float(distances[0][i]), self.metadata[idx]))
            
        return results

    def save(self):
        """
        Persists the index and metadata to disk.
        """
        faiss.write_index(self.index, self.index_file)
        with open(self.meta_file, 'w') as f:
            json.dump(self.metadata, f)
        logger.debug("VectorStore state saved to disk.")
