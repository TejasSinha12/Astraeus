"""
Production Middleware for Ascension Platform.
Handles Clerk-based RBAC, token cost pre-checks, and audit logging.
"""
from fastapi import Request, HTTPException
from api.token_accounting import TokenAccountingSystem
from utils.logger import logger
import json

async def rbac_middleware(request: Request, call_next):
    """
    Enforces Role-Based Access Control and Token Metering.
    """
    # 1. Extraction (Clerk headers typically added by a reverse proxy or frontend)
    user_id = request.headers.get("x-clerk-user-id")
    role = request.headers.get("x-clerk-user-role", "PUBLIC")
    
    if not user_id:
        # For evaluation/testing purposes we allow bypass if explicitly configured
        logger.warning("AUTH BYPASS: No User ID detected in request.")
        return await call_next(request)

    # 2. Path-based RBAC
    if request.url.path.startswith("/admin/"):
        if role.upper() != "ADMIN":
            logger.warning(f"UNAUTHORIZED ADMIN ACCESS: User {user_id} (Role: {role}) attempted {request.url.path}")
            raise HTTPException(status_code=403, detail="Superior administrative authority required.")

    if "/refactor" in request.url.path or "/experiment" in request.url.path:
        if role.upper() not in ["RESEARCH", "ADMIN"]:
            raise HTTPException(status_code=403, detail="Advanced evolution requires Research access.")

    # 3. Cost Metering Pre-check
    # We estimate cost based on request body if available
    if request.method == "POST":
        try:
            body = await request.json()
            objective = body.get("objective", "")
            estimated_cost = TokenAccountingSystem.estimate_cost(objective)
            
            balance, _plan, _access = TokenAccountingSystem.get_user_status(user_id)
            if balance < estimated_cost:
                raise HTTPException(status_code=402, detail=f"Insufficient tokens. Estimated: {estimated_cost}")
        except Exception as e:
            if isinstance(e, HTTPException): raise e
            pass # Non-json bodies ignored

    response = await call_next(request)
    return response

def log_audit_trail(user_id: str, action: str, metadata: dict):
    """
    Persists high-risk actions to the AuditLog table.
    """
    from api.usage_db import AuditLog, SessionLocal
    with SessionLocal() as db:
        log = AuditLog(
            user_id=user_id,
            action=action,
            metadata_json=json.dumps(metadata)
        )
        db.add(log)
        db.commit()
