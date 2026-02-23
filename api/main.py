from fastapi import FastAPI, Header, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uuid

from api.token_accounting import TokenAccountingSystem
from api.core_adapter import CoreAdapter
from api.middleware import rbac_middleware, log_audit_trail
from api.missions import router as missions_router
from utils.logger import logger

app = FastAPI(title="Ascension Intelligence Platform API (Hardened)")
app.include_router(missions_router)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    return {"status": "online", "version": "v2.0.0-PROD", "commit": "a6fbe1a"}

@app.post("/estimate")
async def get_cost_estimate(request: ExecutionRequest):
    cost = TokenAccountingSystem.estimate_cost(request.objective)
    return {"estimated_tokens": cost}

@app.post("/execute/stream")
async def execute_swarm_stream(
    request: ExecutionRequest,
    x_clerk_user_id: str = Header(...),
    x_clerk_user_role: str = Header(default="PUBLIC")
):
    """
    Streaming Execution Gateway.
    Progressive updates via SSE with usage metering.
    """
    request_id = str(uuid.uuid4())
    cost = TokenAccountingSystem.estimate_cost(request.objective)
    
    # Pre-deduction check
    if not TokenAccountingSystem.deduct_tokens(x_clerk_user_id, cost, request_id):
        raise HTTPException(status_code=402, detail="Insufficient Token Balance.")

    log_audit_trail(x_clerk_user_id, "SWARM_STREAM_EXEC", {"objective": request.objective, "req_id": request_id})
    return StreamingResponse(adapter.run_swarm_stream(request.objective, x_clerk_user_id), media_type="text/event-stream")

@app.get("/user/status")
async def get_user_status(x_clerk_user_id: str = Header(...)):
    balance, plan, access = TokenAccountingSystem.get_user_status(x_clerk_user_id)
    return {
        "user_id": x_clerk_user_id,
        "balance": balance,
        "plan": plan,
        "access_level": access
    }

class TopUpRequest(BaseModel):
    user_id: str
    amount: int

@app.post("/admin/topup")
async def top_up_tokens(
    request: TopUpRequest,
    x_clerk_user_role: str = Header(default="PUBLIC")
):
    if x_clerk_user_role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required.")
    
    ref_id = f"admin_refill_{uuid.uuid4().hex[:8]}"
    if TokenAccountingSystem.top_up_tokens(request.user_id, request.amount, ref_id):
        return {"status": "success", "user_id": request.user_id, "new_amount": request.amount}
    else:
        raise HTTPException(status_code=400, detail="Failed to top up user balance.")

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
    
    TokenAccountingSystem.provision_user("user_admin_01", "admin@ascension.ai", "ADMIN", "admin_tier")
    logger.info("Platform Hardened Gateway Active.")
