from fastapi import APIRouter, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import secrets
import hashlib
import datetime
from api.usage_db import SessionLocal, APIKey, UserAccount
from utils.logger import logger

router = APIRouter(prefix="/v1/keys", tags=["Developer Keys"])

class KeyCreate(BaseModel):
    label: str
    scopes: List[str] = ["execute"]

class KeyResponse(BaseModel):
    id: str
    label: str
    scopes: List[str]
    created_at: datetime.datetime
    is_active: bool
    prefix: str = "ast_"

def check_brute_force_lock(key_id: str, db_session) -> bool:
    """
    Analyzes API Key usage velocity to prevent brute-force attacks on the key.
    Locks the key if thresholds are exceeded.
    """
    key = db_session.query(APIKey).filter(APIKey.id == key_id).first()
    if not key or not key.is_active:
        return True
        
    # Heuristic Threshold: If usage radically spikes beyond allocated norms
    if key.current_usage > 1000000: # 1M tokens overload
        key.is_active = False
        db_session.commit()
        logger.error(f"SECURITY: Key {key_id} globally locked due to brute-force usage anomaly!")
        return True
    return False

async def track_key_usage(key_id: str, tokens_consumed: int):
    """
    Tracks metric loads per API key during inference bursts.
    """
    try:
        with SessionLocal() as db:
            key = db.query(APIKey).filter(APIKey.id == key_id).first()
            if key and key.is_active:
                key.current_usage += tokens_consumed
                db.commit()
    except Exception as e:
        logger.error(f"KEYS: Metric tracking failure: {e}")

@router.post("/generate")
async def generate_key(
    request: KeyCreate,
    x_clerk_user_id: str = Header(...)
):
    """
    Generates a new developer API key for programmatic access.
    Supports granular scoping ('execute', 'read-only').
    Returns the raw key ONCE.
    """
    # Restrict invalid scopes
    valid_scopes = {"execute", "read-only", "admin"}
    sanitized_scopes = [s for s in request.scopes if s in valid_scopes]
    if not sanitized_scopes:
        sanitized_scopes = ["read-only"] # Default fallback scope

    # 1. Generate Raw Key
    raw_key = f"ast_{secrets.token_urlsafe(32)}"
    key_id = secrets.token_hex(4)
    key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
    
    with SessionLocal() as db:
        # Check if user exists
        user = db.query(UserAccount).filter(UserAccount.id == x_clerk_user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User account not found.")

        new_key = APIKey(
            id=key_id,
            user_id=x_clerk_user_id,
            key_hash=key_hash,
            label=request.label,
            scopes=",".join(sanitized_scopes),
            is_active=True
        )
        db.add(new_key)
        db.commit()
        
        logger.info(f"KEYS: User {x_clerk_user_id} generated key {key_id} ({request.label})")
        
        return {
            "id": key_id,
            "api_key": raw_key,
            "label": request.label,
            "scopes": sanitized_scopes,
            "hint": f"{raw_key[:7]}...{raw_key[-4:]}"
        }

@router.post("/{key_id}/rotate")
async def rotate_key(key_id: str, x_clerk_user_id: str = Header(...)):
    """
    Gracefully cycles an API Key to a new hash footprint without removing the entity.
    """
    with SessionLocal() as db:
        key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.user_id == x_clerk_user_id).first()
        if not key:
            raise HTTPException(status_code=404, detail="Key mapping unavailable.")
        
        if check_brute_force_lock(key_id, db):
            raise HTTPException(status_code=403, detail="Key locked administratively.")

        raw_key = f"ast_{secrets.token_urlsafe(32)}"
        key.key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
        db.commit()
        
        logger.warning(f"SECURITY: User {x_clerk_user_id} structurally rotated key {key_id}")
        
        # Cross-call to standard ledger is expected from client via separate hook or handled in economy mapping
        return {
            "status": "rotated", 
            "new_api_key": raw_key,
            "hint": f"{raw_key[:7]}...{raw_key[-4:]}"
        }

@router.get("/list")
async def list_keys(x_clerk_user_id: str = Header(...)):
    """
    Returns all active keys for the authenticated user.
    """
    with SessionLocal() as db:
        keys = db.query(APIKey).filter(APIKey.user_id == x_clerk_user_id).all()
        return [
            {
                "id": k.id,
                "label": k.label,
                "scopes": k.scopes.split(",") if k.scopes else [],
                "is_active": k.is_active,
                "created_at": k.created_at,
                "usage": k.current_usage
            } for k in keys
        ]

@router.delete("/{key_id}")
async def revoke_key(key_id: str, x_clerk_user_id: str = Header(...)):
    """
    Permanently revokes an API key.
    """
    with SessionLocal() as db:
        key = db.query(APIKey).filter(APIKey.id == key_id, APIKey.user_id == x_clerk_user_id).first()
        if not key:
            raise HTTPException(status_code=404, detail="Key not found or unauthorized.")
        
        db.delete(key)
        db.commit()
        logger.info(f"KEYS: User {x_clerk_user_id} revoked key {key_id}")
        return {"status": "revoked"}

class WebhookUpdateRequest(BaseModel):
    url: Optional[str] = None

@router.post("/webhook")
async def update_webhook(payload: WebhookUpdateRequest, x_clerk_user_id: str = Header(...)):
    """
    Updates the researcher's outbound webhook target URL.
    """
    with SessionLocal() as db:
        user = db.query(UserAccount).filter(UserAccount.id == x_clerk_user_id).first()
        if not user:
            user = UserAccount(id=x_clerk_user_id, email=f"user_{x_clerk_user_id[:8]}@astraeus.ai")
            db.add(user)
        
        user.webhook_url = payload.url
        db.commit()
        logger.info(f"KEYS: User {x_clerk_user_id} updated webhook -> {payload.url}")
    return {"status": "success", "webhook_url": payload.url}
