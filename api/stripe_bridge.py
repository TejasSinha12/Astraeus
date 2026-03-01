"""
Stripe Payment Bridge for the Ascension Intelligence Economy.
Webhooks for handling credit top-ups and financial settlements.
"""
from fastapi import APIRouter, Request, Header
from core.token_ledger import TokenLedgerService
from utils.logger import logger

router = APIRouter(prefix="/billing", tags=["Billing"])
from core.billing_ledger import BillingLedger
from api.usage_db import SessionLocal, TokenLedger
from utils.logger import logger

router = APIRouter(prefix="/billing", tags=["Billing"])
billing = BillingLedger()

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handles Stripe 'checkout.session.completed' events with idempotency checks.
    """
    payload = await request.json()
    event_type = payload.get("type")
    
    if event_type == "checkout.session.completed":
        session = payload.get("data", {}).get("object", {})
        user_id = session.get("client_reference_id")
        session_id = session.get("id")
        amount_paid = session.get("amount_total", 0) / 100.0 # USD
        
        # 1. Idempotency Check
        with SessionLocal() as db:
            existing = db.query(TokenLedger).filter(TokenLedger.reason.contains(session_id)).first()
            if existing:
                logger.warning(f"BILLING: Duplicate webhook received for session {session_id}. Ignoring.")
                return {"status": "duplicate"}
        
        # 2. Calculate tokens (Premium Tier pricing)
        token_gain = amount_paid * 100.0 # 1 Token = $0.01
        
        # 3. Credit the User Account
        logger.info(f"BILLING: Processing credit for {user_id} -> {token_gain} tokens.")
        
        # In a real scenario, we'd use billing.record_execution_cost for DEBITS
        # and a separate balance credit method. For now, we update UserBalance.
        from api.usage_db import UserBalance
        with SessionLocal() as db:
            balance = db.query(UserBalance).filter(UserBalance.user_id == user_id).first()
            if balance:
                balance.credit_balance += token_gain
                db.commit()
                logger.info(f"BILLING: Credited {token_gain} tokens to {user_id}")
                return {"status": "success"}

    return {"status": "ignored"}
