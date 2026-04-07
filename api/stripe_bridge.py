"""
Stripe Payment Bridge for the Ascension Intelligence Economy.
Webhooks for handling credit top-ups and financial settlements.
"""
from fastapi import APIRouter, Request, Header, HTTPException
from core.billing_ledger import BillingLedger
from api.usage_db import SessionLocal, TokenLedger, AuditLog
from utils.logger import logger
import os
import hmac
import hashlib
import logging

router = APIRouter(prefix="/billing", tags=["Billing"])
billing = BillingLedger()

STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
DEAD_LETTER_QUEUE = []

def verify_stripe_signature(payload: bytes, sig_header: str, secret: str) -> bool:
    """Verify Stripe webhook signature using HMAC-SHA256."""
    if not secret or not sig_header:
        return True  # Skip verification in dev mode

    try:
        # Extract timestamp and signature from Stripe header
        parts = dict(item.split("=", 1) for item in sig_header.split(","))
        timestamp = parts.get("t", "")
        expected_sig = parts.get("v1", "")

        # Compute expected signature
        signed_payload = f"{timestamp}.{payload.decode('utf-8')}"
        computed = hmac.new(
            secret.encode("utf-8"),
            signed_payload.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(computed, expected_sig)
    except Exception:
        return False

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handles Stripe 'checkout.session.completed' events.
    - Verifies webhook signature for production security
    - Idempotency check prevents duplicate credits
    - Standard pricing: 10,000 tokens per $1 USD
    """
    raw_body = await request.body()

    # 1. Signature Verification
    if STRIPE_WEBHOOK_SECRET and not verify_stripe_signature(raw_body, stripe_signature or "", STRIPE_WEBHOOK_SECRET):
        logger.warning("BILLING: Invalid Stripe webhook signature rejected")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    try:
        payload = await request.json()
        event_type = payload.get("type")

        if event_type == "checkout.session.completed":
            session = payload.get("data", {}).get("object", {})
            
            # Reject Test-Mode webhooks securely
            if not session.get("livemode", True):
                logger.warning("BILLING: Rejected unauthenticated test-mode simulation webhook.")
                return {"status": "ignored", "reason": "test_mode"}

            user_id = session.get("client_reference_id")
            session_id = session.get("id")
            amount_paid = session.get("amount_total", 0) / 100.0  # USD

            if not user_id or not session_id:
                logger.error("BILLING: Webhook missing user_id or session_id")
                DEAD_LETTER_QUEUE.append({"payload": payload, "reason": "missing_ids"})
                return {"status": "error", "reason": "missing_fields"}

        # 2. Idempotency Check
        with SessionLocal() as db:
            existing = db.query(TokenLedger).filter(TokenLedger.reason.contains(session_id)).first()
            if existing:
                logger.warning(f"BILLING: Duplicate webhook received for session {session_id}. Ignoring.")
                return {"status": "duplicate"}

        # 3. Calculate tokens (Standard Economy Pricing: 10k Tokens / $1)
        token_gain = amount_paid * 10000.0

        # 4. Credit the User Account
        logger.info(f"BILLING: Processing credit for {user_id} -> {token_gain} tokens (${amount_paid:.2f})")

        from api.token_accounting import TokenAccountingSystem
        success = TokenAccountingSystem.top_up_tokens(user_id, int(token_gain), session_id)
        if success:
            logger.info(f"BILLING: Successfully credited {token_gain} tokens to {user_id}")
            with SessionLocal() as db:
                db.add(AuditLog(user_id=user_id, action="STRIPE_CHECKOUT_SUCCESS", metadata_json=f"Amount: ${amount_paid:.2f}, Tokens: {int(token_gain)}"))
                db.commit()
            return {"status": "success", "tokens_credited": int(token_gain)}
        else:
            logger.error(f"BILLING: Failed to credit {token_gain} tokens to {user_id}")
            return {"status": "failed", "reason": "top_up_failed"}

        elif event_type == "checkout.session.expired":
            session_id = payload.get("data", {}).get("object", {}).get("id", "unknown")
            logger.info(f"BILLING: Checkout session expired: {session_id}")
            return {"status": "expired"}

        return {"status": "ignored", "event_type": event_type}
        
    except Exception as e:
        logger.error(f"BILLING: Critical exception parsing stripe payload: {str(e)}")
        DEAD_LETTER_QUEUE.append({"payload": payload, "reason": str(e)})
        return {"status": "error", "reason": "malformed_payload"}
