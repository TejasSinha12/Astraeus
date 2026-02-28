"""
Billing Exporter for the Ascension Intelligence Economy.
Generates usage analytics and enterprise-grade invoices in JSON/PDF-mock formats.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from api.usage_db import TokenLedger, SessionLocal
import json
import datetime
from utils.logger import logger

class BillingExporter:
    """
    Reporting engine for intelligence consumption.
    Provides structured data for accounting and customer billing.
    """

    def __init__(self, user_id: str):
        self.user_id = user_id

    def get_usage_analytics(self, days: int = 30) -> Dict[str, Any]:
        """
        Aggregates token consumption and reputation gains over a time window.
        """
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
        
        try:
            with SessionLocal() as db:
                logs = db.query(TokenLedger).filter(
                    TokenLedger.user_id == self.user_id,
                    TokenLedger.timestamp >= cutoff
                ).all()
                
                total_spent = sum(abs(l.amount) for l in logs if l.transaction_type == "DEBIT")
                total_reputation = sum(l.amount for l in logs if l.transaction_type == "REPUTATION_GAIN")
                
                # Daily breakdown
                breakdown = {}
                for l in logs:
                    day = l.timestamp.strftime("%Y-%m-%d")
                    breakdown[day] = breakdown.get(day, 0.0) + (abs(l.amount) if l.transaction_type == "DEBIT" else 0.0)
                
                return {
                    "user_id": self.user_id,
                    "window_days": days,
                    "total_tokens_spent": total_spent,
                    "total_reputation_earned": total_reputation,
                    "daily_consumption": breakdown,
                    "transaction_count": len(logs)
                }
        except Exception as e:
            logger.error(f"BILLING: Analytics generation failed: {e}")
            return {}

    def generate_invoice_json(self) -> str:
        """
        Exports a formal billing statement in JSON format.
        """
        analytics = self.get_usage_analytics()
        invoice = {
            "invoice_id": f"INV-{datetime.datetime.utcnow().timestamp()}",
            "date": datetime.datetime.utcnow().isoformat(),
            "customer_id": self.user_id,
            "items": [
                {
                    "description": "AGI Swarm Execution Credits",
                    "quantity": analytics.get("total_tokens_spent", 0.0),
                    "unit_price": 0.01, # 1 token = $0.01
                    "total": analytics.get("total_tokens_spent", 0.0) * 0.01
                }
            ],
            "total_amount_usd": analytics.get("total_tokens_spent", 0.0) * 0.01,
            "currency": "USD",
            "status": "DRAFT"
        }
        return json.dumps(invoice, indent=2)
