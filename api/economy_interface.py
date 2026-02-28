"""
API Interface for the Ascension Intelligence Marketplace and Developer Keys.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.marketplace import MarketplaceManager, MarketplaceCapability
from core.api_key_manager import APIKeyManager
from core.token_ledger import TokenLedgerService
from api.billing_exporter import BillingExporter
from utils.logger import logger

router = APIRouter(prefix="/economy", tags=["Economy"])

marketplace = MarketplaceManager()
key_manager = APIKeyManager()
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
    raw_key, key_id = key_manager.create_key(request.user_id, request.scopes, request.quota)
    if not raw_key:
        raise HTTPException(status_code=500, detail="Failed to create API key.")
    
    return {
        "api_key": raw_key,
        "key_id": key_id,
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
    from api.usage_db import SessionLocal, UserBalance
    with SessionLocal() as db:
        balance = db.query(UserBalance).filter(UserBalance.user_id == x_clerk_user_id).first()
        score = balance.reputation_score if balance else 1.0
        
    return {
        "user_id": x_clerk_user_id,
        "reputation_score": score,
        "governance_weight": weight
    }
