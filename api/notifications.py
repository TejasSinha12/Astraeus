import httpx
import json
import datetime
from typing import Optional, Dict
from utils.logger import logger
from api.usage_db import SessionLocal, UserAccount, AuditLog
import os

class NotificationService:
    """
    Centralized dispatcher for platform events.
    Handles Email (via Resend) and Outbound Webhooks.
    """
    def __init__(self):
        self.resend_api_key = os.getenv("RESEND_API_KEY", "re_placeholder_123")
        self.webhook_url = os.getenv("OUTBOUND_WEBHOOK_URL", None)

    async def send_mission_report(self, email: str, mission_id: str, objective: str, metrics: Dict):
        """
        Sends a high-fidelity HTML report of a completed swarm mission.
        """
        html_content = f"""
        <div style="font-family: sans-serif; background: #050505; color: #fff; padding: 40px; border-radius: 20px;">
            <h1 style="color: #00e5ff; text-transform: uppercase; letter-spacing: 2px;">Mission Absolute</h1>
            <p style="color: #888;">Objective: {objective}</p>
            <hr style="border: 0; border-top: 1px solid #222; margin: 20px 0;">
            <div style="display: grid; gap: 10px;">
                <p><strong>Tokens Consumed:</strong> {metrics.get('tokens', 0)}</p>
                <p><strong>Latency:</strong> {metrics.get('latency', 0)}ms</p>
                <p><strong>Confidence:</strong> {metrics.get('confidence', 0) * 100}%</p>
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #444;">Mission ID: {mission_id}</p>
        </div>
        """
        
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.resend_api_key}", "Content-Type": "application/json"},
                    json={
                        "from": os.getenv("EMAIL_REPLY_HEADER", "Astraeus Platform <noreply@astraeus.ai>"),
                        "to": [email],
                        "subject": f"Mission Report: {objective[:40]}",
                        "html": html_content
                    }
                )
                if resp.status_code == 201:
                    logger.info(f"NOTIFY: Mission report sent to {email}")
                    with SessionLocal() as db:
                        db.add(AuditLog(user_id=email, action="NOTIFICATION_SENT", metadata_json=json.dumps({"type": "mission_report", "mission_id": mission_id})))
                        db.commit()
                else:
                    logger.warning(f"NOTIFY: Failed to send email via Resend: {resp.text}")
        except Exception as e:
            logger.error(f"NOTIFY: Email critical failure: {str(e)}")

    async def trigger_webhook(self, event_type: str, payload: Dict, user_id: Optional[str] = None):
        """
        Dispatches a JSON payload to a user-configured external webhook endpoint.
        If user_id is provided, it attempts to fetch the custom webhook_url from DB.
        """
        target_url = self.webhook_url
        
        if user_id:
            with SessionLocal() as db:
                user = db.query(UserAccount).filter(UserAccount.id == user_id).first()
                if user and user.webhook_url:
                    target_url = user.webhook_url

        if not target_url:
            return

        try:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    target_url,
                    json={
                        "event": event_type,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
                        "payload": payload
                    }
                )
                if resp.status_code in [200, 201, 202, 204]:
                    logger.info(f"NOTIFY: Webhook triggered ({event_type}) -> {resp.status_code} for {user_id}")
                    with SessionLocal() as db:
                        db.add(AuditLog(user_id=user_id or "SYSTEM", action="WEBHOOK_DISPATCHED", metadata_json=json.dumps({"event": event_type, "status": resp.status_code})))
                        db.commit()
                else:
                    logger.warning(f"NOTIFY: Webhook returned non-success: {resp.status_code}")
        except Exception as e:
            logger.error(f"NOTIFY: Webhook failure for {user_id}: {str(e)}")

    async def send_low_balance_alert(self, email: str, current_balance: float):
        """
        Warns the user when their consumable execution units are below safety thresholds.
        """
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.resend_api_key}", "Content-Type": "application/json"},
                    json={
                        "from": os.getenv("EMAIL_REPLY_HEADER", "Astraeus Billing <billing@astraeus.ai>"),
                        "to": [email],
                        "subject": "Platform Execution Credits Low",
                        "html": f"<p>Tokens remaining: {current_balance}. Consider topping up.</p>"
                    }
                )
        except Exception:
            pass

    async def send_payment_success_receipt(self, email: str, amount_paid: float, tokens_received: int):
        """
        Dispatches HTML branded receipt confirming valid topups.
        """
        html_content = f"<h2>Payment Successful</h2><p>Received: ${amount_paid:.2f} USD</p><p>Tokens added: +{tokens_received}</p>"
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.resend_api_key}", "Content-Type": "application/json"},
                    json={
                        "from": os.getenv("EMAIL_REPLY_HEADER", "Astraeus Billing <billing@astraeus.ai>"),
                        "to": [email],
                        "subject": "Astraeus Receipt: Swarm Tokens Added",
                        "html": html_content
                    }
                )
        except Exception:
            pass

    async def send_payment_failed_alert(self, email: str, amount_failed: float):
        """
        Alerts user of card failures / denied Stripe integrations gracefully.
        """
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.resend_api_key}", "Content-Type": "application/json"},
                    json={
                        "from": os.getenv("EMAIL_REPLY_HEADER", "Astraeus Billing <billing@astraeus.ai>"),
                        "to": [email],
                        "subject": "Astraeus: Payment Authorization Failed",
                        "html": f"<p>A charge for ${amount_failed:.2f} USD was declined.</p>"
                    }
                )
        except Exception:
            pass
                    "https://api.resend.com/emails",
                    headers={"Authorization": f"Bearer {self.resend_api_key}", "Content-Type": "application/json"},
                    json={
                        "from": "Astraeus Billing <billing@astraeus.ai>",
                        "to": [email],
                        "subject": "⚠️ Low Execution Credits — Astraeus",
                        "html": f"<div style='font-family: sans-serif; background: #050505; color: #fff; padding: 40px; border-radius: 20px;'>"
                               f"<h2 style='color: #ff6b6b;'>Low Balance Warning</h2>"
                               f"<p>Your Astraeus balance is critically low: <strong style='color: #00e5ff;'>{current_balance:.2f} credits remaining</strong>.</p>"
                               f"<p style='color: #888;'>Top up now to avoid mission interruptions.</p>"
                               f"<a href='https://astraeus-livid.vercel.app/pricing' style='display: inline-block; padding: 12px 24px; background: #00e5ff; color: #000; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px;'>Top Up Now</a>"
                               f"</div>"
                    }
                )
                logger.info(f"NOTIFY: Low balance alert sent to {email}")
        except Exception as e:
            logger.error(f"NOTIFY: Low balance email failed: {str(e)}")
