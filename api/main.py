from fastapi import FastAPI, Header, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid

from api.core_adapter import CoreAdapter
from api.middleware import rbac_middleware, log_audit_trail
from api.missions import router as missions_router
from api.economy_interface import router as economy_router
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

from utils.logger import logger

app = FastAPI(title="Ascension Intelligence Platform")
billing = BillingLedger()

# Setup Observability
setup_telemetry(app)

# Registry of API routes
app.include_router(missions_router)
app.include_router(economy_router)
app.include_router(stripe_router)
app.include_router(admin_router)
app.include_router(research_router)
app.include_router(institutional_router)
app.include_router(rest_router)
app.include_router(keys_router)
app.include_router(github_router)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Economy Services
try:
    reasoning = ReasoningEngine()
    coordinator = GlobalCoordinator(reasoning)
    ledger_service = TokenLedgerService()
    pricing_engine = AdaptivePricingEngine(coordinator)
    abuse_detector = AbuseDetector()
except Exception as e:
    logger.error(f"INIT ERROR: Service initialization failed: {e}")
    reasoning = None
    coordinator = None
    ledger_service = TokenLedgerService()
    pricing_engine = None
    abuse_detector = None

# Initialize decoupled service adapter
adapter = CoreAdapter()

# Attach RBAC Middleware
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    return await rbac_middleware(request, call_next)

class SwarmConfig(BaseModel):
    agents: dict = {"auditor": True, "optimizer": True, "critic": True}
    creativity: float = 0.5
    strictness: float = 0.8

class ExecutionRequest(BaseModel):
    objective: str
    config: SwarmConfig = SwarmConfig()

@app.get("/")
async def root():
    return {"status": "online", "version": "v3.0.0-ECONOMY", "commit": "eb2acad"}

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
    Now enforced by Signed Ledger and Abuse Detection.
    """
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
def startup_db():
    try:
        from api.usage_db import init_platform_db, SessionLocal, SubscriptionPlan
        init_platform_db()
        
        # Seed Plans if missing
        with SessionLocal() as db:
            if not db.query(SubscriptionPlan).first():
                plans = [
                    SubscriptionPlan(id="free_tier", name="Free", monthly_token_limit=5000, access_level=1),
                    SubscriptionPlan(id="research_tier", name="Researcher", monthly_token_limit=50000, access_level=2),
                    SubscriptionPlan(id="admin_tier", name="Admin", monthly_token_limit=1000000, access_level=3)
                ]
                db.add_all(plans)
                db.commit()
                logger.info("API: Subscription plans seeded.")
        
        logger.info("Ascension Intelligence Economy Online.")
    except Exception as e:
        logger.error(f"STARTUP ERROR: Database initialization failed: {e}")
        logger.warning("API will start in DEGRADED mode. Some features may be unavailable.")

