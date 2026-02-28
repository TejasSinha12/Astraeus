"""
Federation Protocol for the Ascension Intelligence Network.
Handles secure, serialized telemetry and command exchange between clusters.
"""
import hmac
import hashlib
import json
import time
from typing import Dict, Any, Optional
from pydantic import BaseModel

from core_config import config
from utils.logger import logger

class FederatedPacket(BaseModel):
    source_cluster: str
    target_cluster: str
    payload: Dict[str, Any]
    timestamp: float
    signature: str

class FederationProtocol:
    """
    Secure communication layer for the Distributed Swarm Federation.
    Ensures message integrity and authenticity across clusters.
    """

    def __init__(self, cluster_id: str, secret_key: str):
        self.cluster_id = cluster_id
        self.secret_key = secret_key
        logger.info(f"FEDERATION-PROT: Initialized for cluster '{cluster_id}'.")

    def _generate_signature(self, data: str) -> str:
        """
        Generates an HMAC-SHA256 signature for the given data.
        """
        return hmac.new(
            self.secret_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()

    def create_packet(self, target_cluster: str, payload: Dict[str, Any]) -> FederatedPacket:
        """
        Wraps a payload into a signed FederatedPacket.
        """
        timestamp = time.time()
        raw_data = f"{self.cluster_id}:{target_cluster}:{timestamp}:{json.dumps(payload)}"
        signature = self._generate_signature(raw_data)
        
        return FederatedPacket(
            source_cluster=self.cluster_id,
            target_cluster=target_cluster,
            payload=payload,
            timestamp=timestamp,
            signature=signature
        )

    def verify_packet(self, packet: FederatedPacket) -> bool:
        """
        Verifies the signature and freshness of a received packet.
        """
        # 1. Freshness Check (Prevent replay attacks - 60s window)
        if time.time() - packet.timestamp > 60:
            logger.warning(f"FEDERATION-PROT: Packet expired from {packet.source_cluster}.")
            return False

        # 2. Signature Verification
        raw_data = f"{packet.source_cluster}:{packet.target_cluster}:{packet.timestamp}:{json.dumps(packet.payload)}"
        expected_signature = self._generate_signature(raw_data)
        
        if hmac.compare_digest(expected_signature, packet.signature):
            return True
        else:
            logger.error(f"FEDERATION-PROT: Invalid signature from {packet.source_cluster}!")
            return False

    def process_telemetry(self, packet: FederatedPacket):
        """
        High-level telemetry ingestion from peer clusters.
        """
        if self.verify_packet(packet):
            logger.info(f"FEDERATION-PROT: Ingested telemetry from '{packet.source_cluster}': {packet.payload.get('event', 'UNKNOWN')}")
            # Further logic for Distributed Intelligence Indexing would follow here
        else:
            logger.error("FEDERATION-PROT: Dropped unverified telemetry packet.")
