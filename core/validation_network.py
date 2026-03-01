"""
Decentralized Validation Network for Ascension.
Manages validator nodes, reputation staking, and replay verification for research integrity.
"""
from typing import List, Dict, Any, Optional
import datetime
from api.usage_db import SessionLocal, ValidatorNode, ResearchArtifact
from utils.logger import logger

class ValidationNetwork:
    """
    Orchestrates external validation of research artifacts.
    """

    def register_validator(self, owner_id: str, node_id: str, stake_amount: float) -> bool:
        """
        Registers an external node for decentralized result verification.
        Requires staking reputation tokens as collateral.
        """
        logger.info(f"VALIDATOR: Registering node {node_id} for user {owner_id}...")
        
        try:
            with SessionLocal() as db:
                node = ValidatorNode(
                    id=node_id,
                    owner_id=owner_id,
                    reputation_staked=stake_amount,
                    last_ping=datetime.datetime.utcnow()
                )
                db.add(node)
                db.commit()
                return True
        except Exception as e:
            logger.error(f"VALIDATOR: Registration failed: {e}")
            return False

    async def submit_verification_claim(self, node_id: str, artifact_id: str, reproduces: bool) -> float:
        """
        Record a validation claim from an external node.
        Updates Node reputation based on consensus correctness.
        """
        logger.info(f"VALIDATOR: Node {node_id} submitted verification for {artifact_id} -> Reproduces: {reproduces}")
        
        with SessionLocal() as db:
            node = db.query(ValidatorNode).filter(ValidatorNode.id == node_id).first()
            if not node:
                return 0.0
            
            # Simple reputation increment for participation
            node.total_validations += 1
            node.reputation_staked += 1.0 if reproduces else -5.0 # Penalty for non-reproducibility
            db.commit()
            
            return node.reputation_staked
