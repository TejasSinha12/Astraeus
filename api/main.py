from fastapi import FastAPI, Header, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
import json
import asyncio
import os
import datetime

from api.core_adapter import CoreAdapter
from api.middleware import rbac_middleware, log_audit_trail
from api.missions import router as missions_router
from api.economy_interface import router as economy_router
from api.forge_api import router as forge_router
from api.stripe_bridge import router as stripe_router
from api.research_interface import router as research_router
from api.institutional_interface import router as institutional_router
from api.rest_interface import router as rest_router
from api.admin import router as admin_router
from api.developer_keys import router as keys_router
from api.github_bridge import router as github_router
from utils.telemetry_config import setup_telemetry

from core.token_ledger import TokenLedgerService
from core.pricing_engine import AdaptivePricingEngine
from core.global_coordinator import GlobalCoordinator
from core.reasoning_engine import ReasoningEngine
from core.abuse_detector import AbuseDetector
from core.billing_ledger import BillingLedger
from core.rate_limiter import rate_limiter
from core.circuit_breaker import circuit_registry

from utils.logger import logger

# Readiness flag — set to True once background engines finish warming
_engines_ready = False

app = FastAPI(title="Ascension Intelligence Platform")
billing = BillingLedger()

# Setup Observability
setup_telemetry(app)

# Registry of API routes
app.include_router(missions_router)
app.include_router(forge_router)
app.include_router(economy_router)
app.include_router(stripe_router)
app.include_router(admin_router)
app.include_router(research_router)
app.include_router(institutional_router)
app.include_router(rest_router)
app.include_router(keys_router)
app.include_router(github_router)

# Register Middlewares (Order matters: CORS -> Isolation -> RBAC)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from api.middleware import OrgIsolationMiddleware
app.add_middleware(OrgIsolationMiddleware)

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    return await rbac_middleware(request, call_next)

# Global Service Holders (Late-initialized for High-Speed Boot)
reasoning = None
coordinator = None
ledger_service = None
pricing_engine = None
abuse_detector = None
adapter = None

# Initialize decoupled service adapter placeholder
adapter = None

class SwarmConfig(BaseModel):
    agents: dict = {"auditor": True, "optimizer": True, "critic": True}
    creativity: float = 0.5
    strictness: float = 0.8

class ExecutionRequest(BaseModel):
    objective: str
    config: SwarmConfig = SwarmConfig()

@app.get("/")
async def root():
    """Lightweight root for engine diagnostics."""
    return {
        "status": "online", 
        "version": "v5.3.0-STABLE", 
        "engine": "Astraeus Swarm Intelligence",
        "org_sovereignty": "ACTIVE"
    }

@app.get("/health")
async def health_check():
    """Lightweight liveness probe for Render / load balancers."""
    return {"status": "alive"}

@app.get("/readiness")
async def readiness_check():
    """Deep readiness probe — checks that background engines have warmed."""
    return {
        "ready": _engines_ready,
        "status": "READY" if _engines_ready else "WARMING",
        "services": {
            "adapter": adapter is not None,
            "pricing_engine": pricing_engine is not None,
            "abuse_detector": abuse_detector is not None,
        },
        "circuits": circuit_registry.get_all_diagnostics(),
    }

@app.get("/v1/system/info")
async def get_system_info():
    """Returns engine transparency metadata."""
    return {
        "engine": "Astraeus",
        "version": "v5.3.0-STABLE",
        "features": ["Forge", "Chronos", "Resilience", "Consensus", "Recovery", "Knowledge", "Sandbox", "Sovereignty", "Telepresence", "CircuitBreaker", "RateLimiter"],
        "status": "OPERATIONAL" if _engines_ready else "WARMING"
    }

@app.get("/v1/swarm/telepresence")
async def stream_telepresence(request: Request):
    """
    Server-Sent Events stream for real-time swarm auditing.
    """
    org_id = getattr(request.state, "org_id", "GLOBAL")
    
    async def event_generator():
        logger.info(f"TELEPRESENCE: New listener connected for Org {org_id}")
        try:
            while True:
                if await request.is_disconnected():
                    logger.info(f"TELEPRESENCE: Listener disconnected for Org {org_id}")
                    break
                    
                data = json.dumps({
                    "timestamp": datetime.datetime.utcnow().isoformat(),
                    "org_id": org_id,
                    "type": "HEARTBEAT",
                    "status": "OPERATIONAL"
                })
                yield f"event: message\ndata: {data}\n\n"
                await asyncio.sleep(10) # Keepalive interval adjusted for stability
        except asyncio.CancelledError:
            logger.info(f"TELEPRESENCE: Stream cancelled for Org {org_id}")

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/estimate")
async def get_cost_estimate(request: ExecutionRequest):
    # Use the new pricing engine for dynamic quotes
    cost = pricing_engine.calculate_cost(request.objective, "GLOBAL_PROBE")
    return {"estimated_tokens": cost}

@app.post("/execute/stream")
async def execute_swarm_stream(
    request: ExecutionRequest,
    x_clerk_user_id: str = Header(...),
    x_clerk_user_role: str = Header(default="PUBLIC")
):
    """
    Streaming Execution Gateway.
    Now enforced by Signed Ledger, Abuse Detection, Rate Limiting, and Circuit Breaker.
    """
    # 0. Readiness Guard
    if not _engines_ready:
        raise HTTPException(status_code=503, detail="Intelligence core is still warming. Retry in a few seconds.")

    # 0.5 Rate Limit Check
    allowed, rate_meta = rate_limiter.check_rate_limit(x_clerk_user_id, tier=x_clerk_user_role)
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Retry after {rate_meta.get('retry_after', 60)}s.",
            headers={"Retry-After": str(rate_meta.get('retry_after', 60))},
        )

    # 0.75 Circuit Breaker Check
    swarm_circuit = circuit_registry.get_or_create("swarm_execution", failure_threshold=5, recovery_timeout=30)
    if not swarm_circuit.allow_request():
        raise HTTPException(status_code=503, detail="Swarm execution circuit is OPEN. System is recovering from errors.")

    # 1. Anti-Abuse Check
    if not abuse_detector.check_for_abuse(x_clerk_user_id, 0.0): # 0.0 as we compute cost next
        raise HTTPException(status_code=429, detail="Resource burst limit exceeded.")

    # 2. Dynamic Pricing
    cost = pricing_engine.calculate_cost(request.objective, "DEFAULT")
    
    # 3. Signed Transaction Pre-Check (Debit)
    success = await ledger_service.process_transaction(
        user_id=x_clerk_user_id,
        amount=-cost,
        tx_type="DEBIT",
        reason=f"Mission Execution: {request.objective[:30]}..."
    )
    
    if not success:
        raise HTTPException(status_code=402, detail="Insufficient credits in signed ledger.")

    log_audit_trail(x_clerk_user_id, "SWARM_STREAM_EXEC", {"objective": request.objective, "cost": cost, "config": request.config.dict()})
    
    swarm_circuit.record_success()
    return StreamingResponse(
        adapter.run_swarm_stream(
            objective=request.objective, 
            user_id=x_clerk_user_id,
            swarm_config=request.config.dict()
        ), 
        media_type="text/event-stream"
    )

@app.get("/user/status")
async def get_user_status(x_clerk_user_id: str = Header(...)):
    """
    Returns the current economy status (balance, reputation, tier).
    Resolves to Organization shared pool if user is institutionalized.
    """
    from api.usage_db import SessionLocal, UserAccount, Organization
    with SessionLocal() as db:
        # 1. Resolve User and Org Affinity
        user = db.query(UserAccount).filter(UserAccount.id == x_clerk_user_id).first()
        if not user:
            # Auto-provision if missing
            user = UserAccount(id=x_clerk_user_id, email=f"user_{x_clerk_user_id[:8]}@astraeus.ai", role="PUBLIC", token_balance=1000)
            db.add(user)
            db.commit()
            db.refresh(user)

        if user.org_id:
            org = db.query(Organization).filter(Organization.id == user.org_id).first()
            if org:
                return {
                    "user_id": x_clerk_user_id,
                    "org_id": user.org_id,
                    "balance": org.token_balance,
                    "reputation": 10.0, # Orgs start with high baseline reputation
                    "tier": "INSTITUTIONAL"
                }

        # 2. Return Individual Balance
        return {
            "user_id": x_clerk_user_id,
            "balance": user.token_balance,
            "reputation": 5.0, # Placeholder for reputation logic
            "tier": user.role
        }

@app.on_event("startup")
async def startup_lifecycle():
    """
    Asynchronous platform startup.
    Handles database provisioning and background service warming.
    """
    global reasoning, coordinator, ledger_service, pricing_engine, abuse_detector
    
    # 1. Immediate Database Provisioning
    try:
        from api.usage_db import init_platform_db, SessionLocal, SubscriptionPlan
        init_platform_db()
        with SessionLocal() as db:
            if not db.query(SubscriptionPlan).first():
                plans = [
                    SubscriptionPlan(id="free_tier", name="Free", monthly_token_limit=5000, access_level=1),
                    SubscriptionPlan(id="research_tier", name="Researcher", monthly_token_limit=50000, access_level=2),
                    SubscriptionPlan(id="admin_tier", name="Admin", monthly_token_limit=1000000, access_level=3)
                ]
                db.add_all(plans)
                db.commit()
    except Exception as e:
        logger.error(f"STARTUP: Database sync failed: {e}")

    # 2. Background Service Warming (Prevents Boot Blocking)
    async def warm_engines():
        global reasoning, coordinator, ledger_service, pricing_engine, abuse_detector, adapter
        try:
            logger.info("STARTUP: Warming intelligence core in background...")
            adapter = CoreAdapter() # CognitionCore init inside
            reasoning = ReasoningEngine()
            coordinator = GlobalCoordinator(reasoning)
            ledger_service = TokenLedgerService()
            pricing_engine = AdaptivePricingEngine(coordinator)
            abuse_detector = AbuseDetector()
            logger.info(f"STARTUP: Intelligence core fully converged for Astraeus v5.3.0.")
            _engines_ready = True
        except Exception as e:
            logger.error(f"STARTUP: Core warming failed: {e}")

    asyncio.create_task(warm_engines())
    logger.info(f"Astraeus v5.3.0 listening on {os.getenv('PORT', '10000')}. Core warming initiated.")

