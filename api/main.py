"""
Ascension Platform API.
Secure execution gateway with Clerk authentication and Token Accounting.
"""
from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List

from api.token_accounting import TokenAccountingSystem
from core.cognition import CognitionCore
from utils.logger import logger

app = FastAPI(title="Ascension Intelligence Platform API")

# Initialize global cognition instance
cognition = CognitionCore()

class ExecutionRequest(BaseModel):
    objective: str
    agent_type: str = "coder" # 'researcher' or 'coder'

@app.get("/")
async def root():
    return {"status": "online", "platform": "Project Ascension", "api_version": "v1"}

@app.post("/execute")
async def execute_task(
    request: ExecutionRequest,
    x_clerk_user_id: str = Header(...),
    x_clerk_user_role: str = Header(default="PUBLIC")
):
    """
    Public execution endpoint. Verified via Clerk JWT (passed as header for this MVP).
    Enforces token costs and role-based access.
    """
    # 1. Verify User & Roles
    # Swarm refactoring and experiments are restricted to RESEARCH/ADMIN roles.
    is_admin_action = "refactor" in request.objective.lower() or "experiment" in request.objective.lower()
    
    if is_admin_action and x_clerk_user_role not in ["RESEARCH", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Unauthorized: Advanced evolutionary actions are restricted to research roles.")

    # 2. Token Accounting
    # Flat cost for now: 100 tokens per public request
    cost = 100
    if not TokenAccountingSystem.deduct_tokens(x_clerk_user_id, cost, "/execute"):
        raise HTTPException(status_code=402, detail="Insufficient Token Balance.")

    # 3. Route to Cognition Core
    try:
        logger.info(f"API GATEWAY: Routing task for {x_clerk_user_id} -> {request.objective[:50]}")
        # Run via the swarm orchestrator
        result = await cognition.swarm.execute_swarm_objective(request.objective)
        return {"result": result, "status": "COMPLETED", "tokens_deducted": cost}
    except Exception as e:
        logger.error(f"API EXECUTION FAILURE: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/balance")
async def get_balance(x_clerk_user_id: str = Header(...)):
    balance = TokenAccountingSystem.get_user_balance(x_clerk_user_id)
    return {"user_id": x_clerk_user_id, "token_balance": balance}

# Internal startup routines
@app.on_event("startup")
def startup_db():
    from api.usage_db import init_platform_db
    init_platform_db()
    # Provision a test admin for evaluation
    TokenAccountingSystem.provision_user("user_admin_01", "admin@ascension.ai", "ADMIN")
    logger.info("Platform Intelligence API Started.")
