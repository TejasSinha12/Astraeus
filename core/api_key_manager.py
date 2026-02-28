"""
API Key Manager for the Ascension Intelligence Economy.
Provides secure, scoped programmatic access for external developers.
"""
import secrets
import hashlib
import json
from typing import List, Optional, Tuple
from api.usage_db import APIKey, SessionLocal
from utils.logger import logger

class APIKeyManager:
    """
    Manages lifecycle and validation of developer access keys.
    Key structure: 'asc_' + 32-char random string.
    """

    def __init__(self):
        logger.info("APIKeyManager initialized.")

    def create_key(self, user_id: str, scopes: List[str], quota: float = 1000.0) -> Tuple[str, str]:
        """
        Generates a new API key and stores its hash.
        Returns the raw key and the hashed ID.
        """
        raw_key = f"asc_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        key_id = key_hash[:8] # First 8 chars of hash for identification
        
        try:
            with SessionLocal() as db:
                entry = APIKey(
                    id=key_id,
                    user_id=user_id,
                    key_hash=key_hash,
                    scopes=json.dumps(scopes),
                    monthly_quota=quota
                )
                db.add(entry)
                db.commit()
                
            logger.info(f"APIKEY: New key created for User {user_id} (ID: {key_id}).")
            return raw_key, key_id
        except Exception as e:
            logger.error(f"APIKEY: Key creation failed: {e}")
            return "", ""

    def validate_key(self, raw_key: str, required_scope: str) -> Optional[APIKey]:
        """
        Validates the key hash, status, and scopes.
        Returns the APIKey object if valid.
        """
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        try:
            with SessionLocal() as db:
                key = db.query(APIKey).filter(APIKey.key_hash == key_hash).first()
                if not key or not key.is_active:
                    return None
                    
                # 1. Quota Check
                if key.current_usage >= key.monthly_quota:
                    logger.warning(f"APIKEY: Quota exceeded for Key {key.id}.")
                    return None
                    
                # 2. Scope Check
                scopes = json.loads(key.scopes) if key.scopes else []
                if required_scope not in scopes:
                    logger.warning(f"APIKEY: Missing scope '{required_scope}' for Key {key.id}.")
                    return None
                
                return key # Caller should handle usage increments atomatically
        except Exception as e:
            logger.error(f"APIKEY: Validation failed: {e}")
            return None

    def increment_usage(self, key_id: str, amount: float):
        """
        Accrues usage against the key's monthly quota.
        """
        try:
            with SessionLocal() as db:
                key = db.query(APIKey).filter(APIKey.id == key_id).first()
                if key:
                    key.current_usage += amount
                    db.commit()
        except Exception as e:
            logger.error(f"APIKEY: Usage tracking failed for {key_id}: {e}")
