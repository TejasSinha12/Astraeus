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

@router.post("/generate")
async def generate_key(
    request: KeyCreate,
    x_clerk_user_id: str = Header(...)
):
    """
    Generates a new developer API key for programmatic access.
    Returns the raw key ONCE.
    """
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
            scopes=",".join(request.scopes),
            is_active=True
        )
        db.add(new_key)
        db.commit()
        
        logger.info(f"KEYS: User {x_clerk_user_id} generated key {key_id} ({request.label})")
        
        return {
            "id": key_id,
            "api_key": raw_key,
            "label": request.label,
            "scopes": request.scopes,
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
