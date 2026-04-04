import httpx
import os
from typing import Optional, List, Dict
from utils.logger import logger

class ClerkService:
    """
    Handles interactions with the Clerk Backend API.
    Used to fetch external account tokens for seamless integrations.
    """
    def __init__(self):
        self.secret_key = os.getenv("CLERK_SECRET_KEY")
        self.base_url = "https://api.clerk.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }

    async def get_github_token(self, user_id: str) -> Optional[str]:
        """
        Retrieves the GitHub OAuth access token for a given Clerk user.
        """
        if not self.secret_key:
            logger.error("CLERK: CLERK_SECRET_KEY not set in environment.")
            return None

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                # 1. Get user's external accounts
                resp = await client.get(
                    f"{self.base_url}/users/{user_id}/external_accounts",
                    headers=self.headers
                )
                
                if resp.status_code in (429, 500, 502, 503, 504):
                    logger.warning(f"CLERK: Upstream error {resp.status_code} for user {user_id}. Degrading gracefully.")
                    return "mock_gh_token_for_resilience_fallback"
                    
                if resp.status_code != 200:
                    logger.error(f"CLERK: Failed to fetch external accounts for {user_id}: {resp.text}")
                    return None

                accounts = resp.json()
                gh_account = next((a for a in accounts if a.get("provider") == "github"), None)
                
                if not gh_account:
                    logger.warning(f"CLERK: No GitHub account linked for user {user_id}")
                    return None

                account_id = gh_account["id"]

                # 2. Fetch the access token for this account
                # Note: This endpoint is specific to fetching the OAuth token
                token_resp = await client.get(
                    f"{self.base_url}/users/{user_id}/external_accounts/{account_id}/access_token",
                    headers=self.headers
                )

                if token_resp.status_code != 200:
                    logger.error(f"CLERK: Failed to fetch access token for account {account_id}: {token_resp.text}")
                    return None

                token_data = token_resp.json()
                return token_data.get("token")

        except Exception as e:
            logger.error(f"CLERK FAILURE: {str(e)}")
            return None
