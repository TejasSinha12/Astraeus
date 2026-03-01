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

from core.token_ledger import TokenLedgerService
from core.pricing_engine import AdaptivePricingEngine
from core.global_coordinator import GlobalCoordinator
from core.reasoning_engine import ReasoningEngine
from core.abuse_detector import AbuseDetector

from utils.logger import logger

app = FastAPI(title="Ascension Intelligence Platform API (Hardened)")
app.include_router(missions_router)
app.include_router(economy_router)
app.include_router(stripe_router)
app.include_router(research_router)
app.include_router(institutional_router)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Economy Services
reasoning = ReasoningEngine()
coordinator = GlobalCoordinator(reasoning)
ledger_service = TokenLedgerService()
pricing_engine = AdaptivePricingEngine(coordinator)
abuse_detector = AbuseDetector()

# Initialize decoupled service adapter
adapter = CoreAdapter()

# Attach RBAC Middleware
@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    return await rbac_middleware(request, call_next)

class ExecutionRequest(BaseModel):
    objective: str

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

    log_audit_trail(x_clerk_user_id, "SWARM_STREAM_EXEC", {"objective": request.objective, "cost": cost})
    return StreamingResponse(adapter.run_swarm_stream(request.objective, x_clerk_user_id), media_type="text/event-stream")

@app.get("/user/status")
async def get_user_status(x_clerk_user_id: str = Header(...)):
    # Fetch from the new UserBalance table
    from api.usage_db import SessionLocal, UserBalance
    with SessionLocal() as db:
        balance = db.get(UserBalance, x_clerk_user_id)
        if not balance:
            # Auto-provision if accessed
            balance = UserBalance(user_id=x_clerk_user_id, credit_balance=100.0)
            db.add(balance)
            db.commit()
            db.refresh(balance)
            
        return {
            "user_id": x_clerk_user_id,
            "balance": balance.credit_balance,
            "reputation": balance.reputation_score,
            "tier": "RESEARCHER" if balance.reputation_score > 5.0 else "PUBLIC"
        }

@app.on_event("startup")
def startup_db():
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
