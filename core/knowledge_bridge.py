import logging
from typing import Dict, Any, List, Optional
import uuid
import datetime
from api.usage_db import SessionLocal, MissionKnowledge, KnowledgeTag

logger = logging.getLogger(__name__)

class KnowledgeBridge:
    """
    Distills insights from completed missions and retrieves relevant pattern
    context for the swarm's future planning steps.
    """
    
    def __init__(self, org_id: Optional[str] = None):
        self.org_id = org_id

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
        
        return knowledge_ids

    async def retrieve_relevant_knowledge(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves past insights relevant to the current objective query.
        For now, this performs a simple tag-based or keyword search.
        """
        logger.info(f"KNOWLEDGE: Retrieving context for query: {query}")
        
        results = []
        with SessionLocal() as db:
            # Mock retrieval: Find any knowledge matching organic keywords
            # In production, this uses vector embeddings similarity search
            knowledge_items = db.query(MissionKnowledge).limit(limit).all()
            
            for item in knowledge_items:
                results.append({
                    "title": item.title,
                    "content": item.content,
                    "category": item.category,
                    "relevance": 0.85 # Mock relevance score
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
