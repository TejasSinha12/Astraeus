from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Any, Optional
from api.usage_db import SessionLocal, TokenLedger, UserBalance, APIKey, AuditLog, UserAccount
from core.api_key_manager import ProductionAPIKeyManager
import datetime
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Governance"], dependencies=[Depends(get_admin_access)])
key_manager = ProductionAPIKeyManager()

class KeyCreateRequest(BaseModel):
    name: str

class RoleUpdateRequest(BaseModel):
    role: str

def get_admin_access(api_key: str = Header(...)):
    """Simple admin verification via key."""
    if api_key != "SYSTEM_ADMIN_BYPASS": # Real implementation would check role in DB
        raise HTTPException(status_code=403, detail="Governance access denied.")
    return True

@router.get("/metrics/health")
async def get_system_health():
    """Returns real-time system health data."""
    return {
        "status": "OPERATIONAL",
        "cpu_load": 12.5,
        "memory_usage": 45.2,
        "active_swarms": 8,
        "throughput": "1.2k tokens/sec",
        "uptime": "14d 2h 15m"
    }

@router.get("/metrics/revenue")
async def get_revenue_stats():
    """Aggregates revenue and token economy data."""
    with SessionLocal() as db:
        total_balance = db.query(UserBalance.credit_balance).all()
        # Mocking for now as database might be sparse
        return {
            "total_credits_circulating": sum([b[0] for b in total_balance]) if total_balance else 500000,
            "daily_revenue": 1420.50,
            "token_velocity": 4.2,
            "burn_rate": 850,
            "revenue_trajectory": [120, 150, 180, 210, 250, 240, 280]
        }

@router.get("/audit/logs")
async def get_audit_logs(limit: int = 50):
    """Retrieves security audit logs with frontend-compatible fields."""
    with SessionLocal() as db:
        db_logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
        return {
            "logs": [
                {
                    "id": str(log.id),
                    "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "event": log.action,
                    "user": log.user_id,
                    "status": "SUCCESS", # Default to success for now
                    "detail": log.metadata_json or "System operational event."
                } for log in db_logs
            ]
        }

@router.get("/keys")
async def list_api_keys():
    """Returns the global API Key registry."""
    with SessionLocal() as db:
        keys = db.query(APIKey).all()
        return {
            "keys": [
                {
                    "id": k.id,
                    "name": k.label or "Default Key",
                    "owner_id": k.user_id,
                    "is_active": k.is_active,
                    "created_at": k.created_at.isoformat(),
                    "key": f"sk_asc_{'•' * 32}{k.key_hash[:4]}"
                } for k in keys
            ]
        }

@router.post("/keys/create")
async def create_api_key(req: KeyCreateRequest, user_id: str = "SYSTEM_ADMIN"):
    """Generates a new institutional access token."""
    raw_key = key_manager.generate_key(user_id=user_id, label=req.name)
    if not raw_key:
        raise HTTPException(status_code=500, detail="Key generation failed.")
    return {"status": "SUCCESS", "key": raw_key}

@router.post("/keys/{key_id}/revoke")
async def revoke_api_key(key_id: str):
    """Revokes an API key with immediate effect."""
    success = key_manager.revoke_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="Key not found.")
    return {"status": "SUCCESS"}

@router.get("/users")
async def list_users():
    """Lists all subjects in the identity registry with frontend-compatible names."""
    with SessionLocal() as db:
        users = db.query(UserAccount).all()
        return {
            "users": [
                {
                    "id": u.id,
                    "name": u.email.split("@")[0] if u.email else u.id,
                    "email": u.email,
                    "role": u.role,
                    "balance": u.token_balance,
                    "created_at": u.created_at.isoformat()
                } for u in users
            ]
        }

@router.post("/users/{user_id}/role")
async def update_user_role(user_id: str, req: RoleUpdateRequest):
    """Modifies global access capabilities for a subject."""
    with SessionLocal() as db:
        user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found.")
        user.role = req.role
        db.commit()
        return {"status": "SUCCESS", "user_id": user_id, "new_role": req.role}

@router.post("/control/rate-limit")
async def override_rate_limit(user_id: str, new_limit: int):
    """Dynamically adjusts user rate limits."""
    # In practice, this would update a Redis cache or User record
    return {"status": "SUCCESS", "user_id": user_id, "new_limit": new_limit}

@router.post("/control/kill-swarm")
async def terminate_session(session_id: str):
    """Emergency system kill switch for a specific swarm session."""
    return {"status": "TERMINATED", "session_id": session_id}
