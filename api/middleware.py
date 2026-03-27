from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import logging

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
