"""
Conflict Resolution Layer for Multi-Agent Swarm.
Uses consensus scoring to arbitrate between differing implementer proposals.
"""
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from utils.logger import logger

class AgentVerdict(BaseModel):
    agent_id: str
    confidence: float = Field(ge=0.0, le=1.0)
    vote: bool
    rationale: str

class ConflictResolver:
    """
    Arbitrates conflicts when multiple agents produce differing solutions.
    """

    @staticmethod
    def arbitrate(proposals: List[Dict[str, Any]], critique_verdicts: List[AgentVerdict]) -> Dict[str, Any]:
        """
        Selects the winning proposal based on a weighted consensus of reviews.
        """
        logger.info(f"Arbitrating {len(proposals)} proposals among {len(critique_verdicts)} reviewers.")
        
        # Simple weighted implementation for MVP:
        # Each proposal is associated with its critique by index
        scores = []
        for i, verdict in enumerate(critique_verdicts):
            # Proposal score = confidence * (1 if approved else -1)
            score = verdict.confidence if verdict.vote else -verdict.confidence
            scores.append(score)
            
        winning_index = scores.index(max(scores))
        logger.info(f"Proposal {winning_index} selected as Swarm Consensus.")
        return proposals[winning_index]
