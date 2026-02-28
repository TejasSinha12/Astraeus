"""
Consensus Engine for the Ascension Intelligence Federation.
Manages quorum-based validation for cross-cluster refactors and policy changes.
"""
from typing import Dict, List, Any
from pydantic import BaseModel
import datetime

from utils.logger import logger

class Proposal(BaseModel):
    id: str
    origin_cluster: str
    change_summary: str
    votes: Dict[str, bool] = {} # cluster_id -> vote
    quorum_threshold: int = 3
    is_executed: bool = False

class ConsensusEngine:
    """
    Enforces quorum-based promotion of architectural changes.
    Prevents single-cluster failures from propagating to the global network.
    """

    def __init__(self, cluster_ids: List[str]):
        self.cluster_ids = cluster_ids
        self.proposals: Dict[str, Proposal] = {}
        logger.info(f"CONSENSUS-ENG: Engine online with {len(cluster_ids)} peer clusters.")

    def get_quorum_threshold(self) -> int:
        """Returns the number of 'YES' votes required for a majority."""
        return max(2, len(self.cluster_ids) // 2 + 1)

    def submit_proposal(self, proposal_id: str, cluster_id: str, summary: str) -> Proposal:
        """
        Submits a new refactor proposal for federation-wide voting.
        """
        proposal = Proposal(
            id=proposal_id,
            origin_cluster=cluster_id,
            change_summary=summary,
            quorum_threshold=max(2, len(self.cluster_ids) // 2 + 1)
        )
        self.proposals[proposal_id] = proposal
        logger.info(f"CONSENSUS-ENG: New proposal [{proposal_id}] submitted by '{cluster_id}'.")
        return proposal

    def cast_vote(self, proposal_id: str, cluster_id: str, vote: bool) -> bool:
        """
        Casts a vote for an active proposal.
        """
        if proposal_id not in self.proposals:
            logger.warning(f"CONSENSUS-ENG: Vote attempt for missing proposal {proposal_id}.")
            return False
            
        proposal = self.proposals[proposal_id]
        proposal.votes[cluster_id] = vote
        
        logger.info(f"CONSENSUS-ENG: Cluster '{cluster_id}' voted {'YES' if vote else 'NO'} on [{proposal_id}].")
        
        # Check if quorum is reached
        yes_votes = sum(1 for v in proposal.votes.values() if v)
        if yes_votes >= proposal.quorum_threshold and not proposal.is_executed:
            self._finalize_proposal(proposal_id)
            return True
            
        return False

    def _finalize_proposal(self, proposal_id: str):
        """
        Finalizes an approved proposal for global promotion.
        """
        proposal = self.proposals[proposal_id]
        proposal.is_executed = True
        logger.info(f"CONSENSUS-ENG: Proposal [{proposal_id}] reached QUORUM. Executing global refactor...")
        # Integration with FederatedMemory or MetaGovernance would happen here
