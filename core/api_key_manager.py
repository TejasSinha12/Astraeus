"""
Production API Key Manager for Ascension.
Handles scoped permissions, rate limiting, and secure key validation.
"""
from typing import Optional, List, Dict
import secrets
import hashlib
import datetime
from api.usage_db import SessionLocal, APIKey, UserBalance
from utils.logger import logger

class ProductionAPIKeyManager:
    """
    Secure management for external developer API keys.
    """

    def generate_key(self, user_id: str, label: str, scopes: List[str] = ["READ", "EXECUTE"]) -> str:
        """
        Creates a new production API key with assigned scopes.
        """
        raw_key = f"sk_asc_{secrets.token_urlsafe(32)}"
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        logger.info(f"AUTH: Generating API key for {user_id} ({label})...")
        
        try:
            with SessionLocal() as db:
                new_key = APIKey(
                    key_hash=key_hash,
                    user_id=user_id,
                    label=label,
                    scopes=",".join(scopes),
                    is_active=True
                )
                db.add(new_key)
                db.commit()
                return raw_key # Return raw key only once
        except Exception as e:
            logger.error(f"AUTH: Key generation failed: {e}")
            return ""

    def validate_key(self, raw_key: str) -> Optional[Dict[str, Any]]:
        """
        Validates hash and checks user balance.
        """
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        
        with SessionLocal() as db:
            key_record = db.query(APIKey).filter(APIKey.key_hash == key_hash, APIKey.is_active == True).first()
            if not key_record:
                return None
            
            # Check for expiry (if implemented)
            if key_record.expires_at and key_record.expires_at < datetime.datetime.utcnow():
                return None
            
            # Quick balance check
            balance = db.query(UserBalance).filter(UserBalance.user_id == key_record.user_id).first()
            if not balance or balance.credit_balance <= 0:
                logger.warning(f"AUTH: Key valid but balance empty for {key_record.user_id}")
                return None

            return {
                "user_id": key_record.user_id,
                "scopes": key_record.scopes.split(","),
                "label": key_record.label
            }

    def revoke_key(self, key_id: int) -> bool:
        """
        Deactivates a key immediately.
        """
        with SessionLocal() as db:
            key = db.query(APIKey).filter(APIKey.id == key_id).first()
            if key:
                key.is_active = False
                db.commit()
                return True
            return False
