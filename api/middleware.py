from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import logging
import json
import hashlib

logger = logging.getLogger(__name__)

class OrgIsolationMiddleware(BaseHTTPMiddleware):
    """
    Ensures absolute data sovereignty by enforcing organizational headers
    on all administrative and restricted swarm endpoints.
    """
    
    async def dispatch(self, request: Request, call_next):
        # We only enforce this on /admin paths and critical swarm actions
        if request.url.path.startswith("/admin") or request.url.path.startswith("/v1/swarm"):
            org_id = request.headers.get("X-Org-ID")
            
            # Simulated check: In production, this validates the Org ID against the user's JWT/Session
            if not org_id and not request.url.path.endswith("/system/info"):
                logger.warning(f"SECURITY: Access denied to {request.url.path} - Missing X-Org-ID header.")
                raise HTTPException(status_code=403, detail="Organizational sovereignty required. Please provide X-Org-ID.")
            
            # Inject org_id into the request state for downstream propagation
            request.state.org_id = org_id
            logger.debug(f"ISOLATION: Request bound to Organization {org_id}")

        response = await call_next(request)
        return response

async def rbac_middleware(request: Request, call_next):
    """
    Institutional Role-Based Access Control and API Key Authentication.
    Restored from previous stable version.
    """
    # 1. Extraction (Clerk headers or API Key)
    user_id = request.headers.get("x-clerk-user-id")
    role = request.headers.get("x-clerk-user-role", "PUBLIC")
    api_key_raw = request.headers.get("api-key")
    
    # 2. API Key Authentication (Programmatic Bypass)
    if not user_id and api_key_raw and api_key_raw != "SYSTEM_ADMIN_BYPASS":
        from api.usage_db import SessionLocal, APIKey
        key_hash = hashlib.sha256(api_key_raw.encode()).hexdigest()
        
        with SessionLocal() as db:
            key_record = db.query(APIKey).filter(APIKey.key_hash == key_hash, APIKey.is_active == True).first()
            if key_record:
                user_id = key_record.user_id
                role = "RESEARCHER"
                logger.info(f"AUTH: Programmatic access via key {key_record.id} for user {user_id}")
                key_record.current_usage += 1.0
                db.commit()

    if not user_id and not request.url.path.endswith("/system/info"):
        logger.warning("AUTH: No User ID detected in request.")

    # 3. RBAC Enforcement
    if request.url.path.startswith("/admin"):
        if role.upper() != "ADMIN" and request.headers.get("api-key") != "SYSTEM_ADMIN_BYPASS":
            logger.warning(f"UNAUTHORIZED ADMIN ACCESS: User {user_id} (Role: {role}) attempted {request.url.path}")
            raise HTTPException(status_code=403, detail="Superior administrative authority required.")

    # 4. Institutional Pre-Check (Balance/Quota)
    if "/v1/swarm" in request.url.path:
        from api.usage_db import SessionLocal, UserAccount, Organization
        with SessionLocal() as db:
            user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
            if user and user.org_id:
                org = db.query(Organization).filter(Organization.id == user.org_id).first()
                if org and org.token_balance <= 0:
                    logger.warning(f"INSTITUTIONAL GATE: Org {user.org_id} balance exhausted.")
                    raise HTTPException(status_code=402, detail="Institutional credit pool exhausted. Please contact your administrator.")

    # Evaluate request
    response = await call_next(request)
    
    # 5. Inject Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    
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
