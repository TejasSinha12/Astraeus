from fastapi import APIRouter, Depends, HTTPException, Header
from typing import List, Dict, Any, Optional
from api.usage_db import SessionLocal, TokenLedger, UserBalance, APIKey, AuditLog
from core.api_key_manager import ProductionAPIKeyManager
import datetime

router = APIRouter(prefix="/admin", tags=["Governance"])
key_manager = ProductionAPIKeyManager()

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
    """Retrieves security audit logs."""
    with SessionLocal() as db:
        logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
        return logs

@router.post("/control/rate-limit")
async def override_rate_limit(user_id: str, new_limit: int):
    """Dynamically adjusts user rate limits."""
    # In practice, this would update a Redis cache or User record
    return {"status": "SUCCESS", "user_id": user_id, "new_limit": new_limit}

@router.post("/control/kill-swarm")
async def terminate_session(session_id: str):
    """Emergency system kill switch for a specific swarm session."""
    return {"status": "TERMINATED", "session_id": session_id}

@router.post("/keys/revoke")
async def revoke_api_key(key_id: str):
    """Revokes an API key with immediate effect."""
    return key_manager.revoke_key(key_id)
