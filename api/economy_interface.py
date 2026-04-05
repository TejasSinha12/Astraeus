"""
API Interface for the Ascension Intelligence Marketplace and Developer Keys.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.marketplace import MarketplaceManager, MarketplaceCapability
from core.api_key_manager import ProductionAPIKeyManager
from core.token_ledger import TokenLedgerService
from api.billing_exporter import BillingExporter
from utils.logger import logger

router = APIRouter(prefix="/economy", tags=["Economy"])

marketplace = MarketplaceManager()
key_manager = ProductionAPIKeyManager()
ledger = TokenLedgerService()

class APIKeyRequest(BaseModel):
    user_id: str
    scopes: List[str]
    quota: float = 1000.0

@router.get("/marketplace")
async def list_marketplace() -> List[MarketplaceCapability]:
    """
    Returns all discoverable swarm clusters and their pricing.
    """
    return marketplace.list_market_endpoints()

@router.post("/keys")
async def create_api_key(request: APIKeyRequest):
    """
    Generates a new developer access key with scoped permissions.
    """
    raw_key = key_manager.generate_key(request.user_id, label="Economy Interface Key", scopes=request.scopes)
    if not raw_key:
        raise HTTPException(status_code=500, detail="Failed to create API key.")
    
    return {
        "api_key": raw_key,
        "message": "Store this key securely. It will not be shown again."
    }

@router.get("/billing/analytics")
async def get_billing_analytics(x_clerk_user_id: str = Header(...)):
    """
    Retrieves 30-day token consumption and reputation history.
    """
    exporter = BillingExporter(x_clerk_user_id)
    return exporter.get_usage_analytics()

@router.get("/billing/invoice")
async def download_invoice(x_clerk_user_id: str = Header(...)):
    """
    Generates a JSON invoice for the current billing cycle.
    """
    exporter = BillingExporter(x_clerk_user_id)
    return exporter.generate_invoice_json()

@router.get("/reputation")
async def get_reputation(x_clerk_user_id: str = Header(...)):
    """
    Returns the user's current reputation score and governance voting weight.
    """
    from core.reputation_tracker import ReputationTracker
    tracker = ReputationTracker(ledger)
    weight = await tracker.calculate_voting_weight(x_clerk_user_id)
    
    # We need to fetch the score from the DB
    from api.usage_db import SessionLocal, UserAccount
    with SessionLocal() as db:
        user = db.query(UserAccount).filter(UserAccount.id == x_clerk_user_id).first()
        score = user.reputation_score if user else 1.0
        
    return {
        "user_id": x_clerk_user_id,
        "reputation_score": score,
        "governance_weight": weight
    }

@router.get("/history")
async def get_ledger_history(user_id: str = Header(..., alias="x-clerk-user-id")):
    """
    Retrieves the raw TokenLedger transactions for the user.
    """
    txs = ledger.get_transactions(user_id)
    return {"transactions": txs}

@router.get("/verify")
async def verify_ledger(user_id: str = Header(..., alias="x-clerk-user-id")):
    """
    Runs a cryptographic sweep of the user's ledger chain.
    """
    is_valid = ledger.verify_chain_integrity(user_id)
    if not is_valid:
        raise HTTPException(status_code=409, detail="Ledger chain corruption detected.")
    return {"verified": True, "entity_id": user_id}

@router.get("/pricing/current")
async def get_current_pricing():
    """
    Exposes the dynamic surge global pricing variables to developers.
    """
    from core.pricing_engine import AdaptivePricingEngine
    from core.global_coordinator import GlobalCoordinator
    # Instantiate standalone instances for stateless API probing
    coordinator = GlobalCoordinator()
    pricing = AdaptivePricingEngine(coordinator)
    surge = pricing.calculate_dynamic_surge()
    return {"surge_multiplier": surge, "base_cost": pricing.base_execution_cost}
