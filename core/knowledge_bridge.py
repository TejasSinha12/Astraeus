import logging
from typing import Dict, Any, List, Optional
import uuid
import datetime
from api.usage_db import SessionLocal, MissionKnowledge, KnowledgeTag
import chromadb
from chromadb.config import Settings
import os

logger = logging.getLogger(__name__)

class KnowledgeBridge:
    """
    Distills insights from completed missions and retrieves relevant pattern
    context for the swarm's future planning steps.
    """
    
    def __init__(self, org_id: Optional[str] = None):
        self.org_id = org_id
        
        # Initialize Vector Database
        db_path = os.getenv("VECTOR_DB_PATH", "./.chroma_db")
        self.chroma_client = chromadb.PersistentClient(path=db_path)
        self.collection = self.chroma_client.get_or_create_collection(
            name="mission_insights",
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"KNOWLEDGE: ChromaDB vector store initialized at {db_path}")

    async def distill_mission_insight(self, mission_id: str, trace_steps: List[Dict[str, Any]]) -> List[str]:
        """
        Analyzes a successful mission trace to extract reusable patterns or 'lessons'.
        In a production scenario, this would call a 'Synthesizer' LLM.
        """
        logger.info(f"KNOWLEDGE: Distilling insights from mission {mission_id}")
        
        # Simulated distillation logic
        insights = [
            {
                "title": "Optimized React State Management",
                "content": "Using useSWR with pre-configured fetcher reduced boilerplate by 15%.",
                "category": "ARCH_PATTERN",
                "tags": ["react", "swr", "frontend"]
            },
            {
                "title": "FastAPI Validation Pattern",
                "content": "Pydantic models with custom validators caught 3 early-stage logic drift errors.",
                "category": "TOOL_USE",
                "tags": ["fastapi", "pydantic", "validation"]
            }
        ]
        
        knowledge_ids = []
        with SessionLocal() as db:
            for ins in insights:
                k_id = str(uuid.uuid4())
                knowledge = MissionKnowledge(
                    id=k_id,
                    org_id=self.org_id,
                    mission_id=mission_id,
                    title=ins["title"],
                    content=ins["content"],
                    category=ins["category"],
                    utility_score=0.9
                )
                db.add(knowledge)
                
                for t in ins["tags"]:
                    tag = KnowledgeTag(knowledge_id=k_id, tag=t)
                    db.add(tag)
                
                knowledge_ids.append(k_id)
            
            db.commit()
            
        # Add to vector DB for semantic search
        try:
            self.collection.add(
                ids=knowledge_ids,
                documents=[ins["content"] for ins in insights],
                metadatas=[
                    {
                        "title": ins["title"],
                        "category": ins["category"],
                        "org_id": self.org_id or "GLOBAL",
                        "mission_id": mission_id
                    } for ins in insights
                ]
            )
            logger.info(f"KNOWLEDGE: Successfully indexed {len(insights)} insights into vector store.")
        except Exception as e:
            logger.error(f"KNOWLEDGE: Failed to index insights in ChromaDB: {e}")
        
        return knowledge_ids

    def batch_index(self, insights_batch: List[Dict[str, Any]]) -> List[str]:
        """
        Indexes a large array of pre-calculated insights to optimize ChromaDB network paths.
        """
        knowledge_ids = []
        try:
            import uuid
            with SessionLocal() as db:
                for ins in insights_batch:
                    k_id = str(uuid.uuid4())
                    knowledge = MissionKnowledge(
                        id=k_id,
                        org_id=ins.get("org_id", self.org_id),
                        mission_id=ins.get("mission_id", "BATCH"),
                        title=ins["title"],
                        content=ins["content"],
                        category=ins.get("category", "GENERAL"),
                        utility_score=0.9
                    )
                    db.add(knowledge)
                    
                    for t in ins.get("tags", []):
                        db.add(KnowledgeTag(knowledge_id=k_id, tag=t))
                    
                    knowledge_ids.append(k_id)
                db.commit()

            self.collection.add(
                ids=knowledge_ids,
                documents=[ins["content"] for ins in insights_batch],
                metadatas=[
                    {
                        "title": ins["title"],
                        "category": ins.get("category", "GENERAL"),
                        "org_id": ins.get("org_id", self.org_id) or "GLOBAL",
                        "mission_id": ins.get("mission_id", "BATCH")
                    } for ins in insights_batch
                ]
            )
            logger.info(f"KNOWLEDGE: Batch indexed {len(insights_batch)} insights into federated vector store.")
        except Exception as e:
            logger.error(f"KNOWLEDGE: Batch index failed critically: {e}")
            
        return knowledge_ids

    def optimize_index(self) -> None:
        """
        Runs compaction and vacuuming on the underlying metadata indices.
        """
        try:
            with SessionLocal() as db:
                from sqlalchemy import text
                db.execute(text('VACUUM'))
                db.commit()
            logger.info("KNOWLEDGE: Vector DB metadata optimized and compacted.")
        except Exception as e:
            logger.error(f"KNOWLEDGE: Vector Index optimization failed: {e}")

    async def retrieve_relevant_knowledge(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves past insights relevant to the current objective query.
        Uses vector embeddings similarity search via ChromaDB.
        """
        logger.info(f"KNOWLEDGE: Retrieving context for query: {query}")
        
        results = []
        try:
            # Semantic search
            search_results = self.collection.query(
                query_texts=[query],
                n_results=limit,
                where={"org_id": self.org_id or "GLOBAL"}
            )
            
            if search_results["documents"] and search_results["documents"][0]:
                for idx, doc in enumerate(search_results["documents"][0]):
                    metadata = search_results["metadatas"][0][idx]
                    distance = search_results["distances"][0][idx] if "distances" in search_results else 0.0
                    
                    results.append({
                        "title": metadata.get("title", "Insight"),
                        "content": doc,
                        "category": metadata.get("category", "GENERAL"),
                        "relevance": max(0.0, 1.0 - (distance / 2.0))  # Normalize cosine distance
                    })
        except Exception as e:
            logger.error(f"KNOWLEDGE: Vector search failed: {e}. Falling back to standard DB.")
            with SessionLocal() as db:
                knowledge_items = db.query(MissionKnowledge).filter(MissionKnowledge.org_id == self.org_id).limit(limit).all()
                for item in knowledge_items:
                    results.append({
                        "title": item.title,
                        "content": item.content,
                        "category": item.category,
                        "relevance": 0.5 # Default fallback relevance
                    })
        
        return results

    def format_knowledge_context(self, knowledge_items: List[Dict[str, Any]]) -> str:
        """
        Formats retrieved knowledge into a markdown block for LLM system prompt injection.
        """
        if not knowledge_items:
            return ""
            
        context = "\n### SWARM COLLECTIVE MEMORY (Relevant Lessons Learned)\n"
        for item in knowledge_items:
            context += f"- **{item['title']}** [{item['category']}]: {item['content']}\n"
        
        return context
