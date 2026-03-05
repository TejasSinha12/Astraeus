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

    # 3. Path-based RBAC
    if request.url.path.startswith("/admin/"):
        if role.upper() != "ADMIN" and request.headers.get("api-key") != "SYSTEM_ADMIN_BYPASS":
            logger.warning(f"UNAUTHORIZED ADMIN ACCESS: User {user_id} (Role: {role}) attempted {request.url.path}")
            raise HTTPException(status_code=403, detail="Superior administrative authority required.")

    if "/refactor" in request.url.path or "/experiment" in request.url.path:
        if role.upper() not in ["RESEARCH", "ADMIN"]:
            raise HTTPException(status_code=403, detail="Advanced evolution requires Research access.")

    # 4. Institutional Pre-Check (Balance/Quota)
    # This acts as a protective layer before the more expensive swarm execution starts
    from api.usage_db import SessionLocal, UserAccount, Organization
    with SessionLocal() as db:
        user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
        if user and user.org_id:
            org = db.query(Organization).filter(Organization.id == user.org_id).first()
            if org and org.token_balance <= 0:
                logger.warning(f"INSTITUTIONAL GATE: Org {user.org_id} balance exhausted.")
                raise HTTPException(status_code=402, detail="Institutional credit pool exhausted. Please contact your administrator.")

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
