"""
Stripe Payment Bridge for the Ascension Intelligence Economy.
Webhooks for handling credit top-ups and financial settlements.
"""
from fastapi import APIRouter, Request, Header
from core.token_ledger import TokenLedgerService
from utils.logger import logger

router = APIRouter(prefix="/billing", tags=["Billing"])
ledger = TokenLedgerService()

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handles Stripe 'checkout.session.completed' events.
    Mocks credit top-up logic for the intelligence economy.
    """
    payload = await request.json()
    event_type = payload.get("type")
    
    if event_type == "checkout.session.completed":
        session = payload.get("data", {}).get("object", {})
        user_id = session.get("client_reference_id")
        amount_paid = session.get("amount_total", 0) / 100.0 # USD
        
        # 1. Calculate tokens (1 token = $0.01)
        token_gain = amount_paid * 100.0
        
        # 2. Credit the Ledger
        success = await ledger.process_transaction(
            user_id=user_id,
            amount=token_gain,
            tx_type="CREDIT",
            reason=f"Stripe Top-up: {session.get('id')}"
        )
        
        if success:
            logger.info(f"BILLING: Successfully credited {token_gain} tokens to User {user_id}.")
            return {"status": "success"}
            
    return {"status": "ignored"}
