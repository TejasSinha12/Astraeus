"""
Revenue-Grade Billing Ledger for Ascension.
PostgreSQL-backed record of execution time, model calls, and cost with cryptographic integrity.
"""
from typing import Dict, Any, Optional
import datetime
import hashlib
import json
from api.usage_db import SessionLocal, TokenLedger, UserBalance
from utils.logger import logger

class BillingLedger:
    """
    High-fidelity financial ledger for AGI execution.
    """

    def record_execution_cost(
        self, 
        user_id: str, 
        request_id: str, 
        tokens_used: float, 
        reasoning_depth: int, 
        model_tier: str = "PREMIUM"
    ) -> bool:
        """
        Calculates and records the cost of a specific swarm execution.
        """
        # 1. Complex Cost Calculation
        unit_price = 0.01 if model_tier == "STANDARD" else 0.05
        execution_tax = 0.10 * reasoning_depth # Platform fee based on swarm complexity
        total_cost = (tokens_used * unit_price) + execution_tax

        logger.info(f"BILLING: Recording cost for {user_id} -> {total_cost} Units (Tax: {execution_tax})")

        try:
            with SessionLocal() as db:
                # 2. Update User Balance
                balance = db.query(UserBalance).filter(UserBalance.user_id == user_id).first()
                if not balance or balance.credit_balance < total_cost:
                    logger.warning(f"BILLING: Insufficient credits for {user_id}")
                    return False
                
                balance.credit_balance -= total_cost
                
                # 3. Create Signed Ledger Record
                prev_record = db.query(TokenLedger).order_by(TokenLedger.timestamp.desc()).first()
                prev_hash = prev_record.signature if prev_record else "GENESIS"
                
                record_data = {
                    "user_id": user_id,
                    "amount": -total_cost,
                    "reason": f"Execution {request_id} (Depth: {reasoning_depth})",
                    "prev_hash": prev_hash,
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }
                
                signature = hashlib.sha256(json.dumps(record_data, sort_keys=True).encode()).hexdigest()
                
                ledger_entry = TokenLedger(
                    user_id=user_id,
                    transaction_type="DEBIT",
                    amount=-total_cost,
                    reason=record_data["reason"],
                    previous_hash=prev_hash,
                    signature=signature
                )
                
                db.add(ledger_entry)
                db.commit()
                return True
        except Exception as e:
            logger.error(f"BILLING: Ledger update failed: {e}")
            return False
