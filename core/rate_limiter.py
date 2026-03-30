"""
Sliding Window Rate Limiter for Astraeus Platform.
In-memory implementation with per-user and per-org bucketing.
Production deployments should swap the backend to Redis via RATE_LIMIT_BACKEND env var.
"""
import time
import os
from collections import defaultdict
from typing import Dict, Optional, Tuple
from utils.logger import logger


class SlidingWindowRateLimiter:
    """
    Token-bucket rate limiter with a configurable sliding window.
    Supports per-user and per-organization rate limiting with burst allowances.
    """

    def __init__(
        self,
        default_rpm: int = 60,
        burst_multiplier: float = 1.5,
        window_seconds: int = 60,
    ):
        self.default_rpm = default_rpm
        self.burst_multiplier = burst_multiplier
        self.window_seconds = window_seconds

        # Tier-based limits (requests per minute)
        self.tier_limits: Dict[str, int] = {
            "PUBLIC": 30,
            "RESEARCHER": 60,
            "INSTITUTIONAL": 120,
            "ADMIN": 500,
        }

        # In-memory sliding window store: { key: [(timestamp, weight), ...] }
        self._windows: Dict[str, list] = defaultdict(list)

        # Cooldown tracking for abuse escalation
        self._violations: Dict[str, int] = defaultdict(int)

        logger.info(
            f"RateLimiter initialized. Default: {default_rpm} RPM, "
            f"Window: {window_seconds}s, Burst: {burst_multiplier}x"
        )

    def _prune_window(self, key: str, now: float) -> None:
        """Remove expired entries from the sliding window."""
        cutoff = now - self.window_seconds
        self._windows[key] = [
            (ts, w) for ts, w in self._windows[key] if ts > cutoff
        ]

    def check_rate_limit(
        self,
        user_id: str,
        tier: str = "PUBLIC",
        weight: float = 1.0,
        org_id: Optional[str] = None,
    ) -> Tuple[bool, Dict]:
        """
        Returns (allowed: bool, metadata: dict).
        Metadata includes remaining quota, reset time, and retry-after hints.
        """
        now = time.time()
        key = f"user:{user_id}"
        limit = self.tier_limits.get(tier.upper(), self.default_rpm)
        burst_limit = int(limit * self.burst_multiplier)

        # Prune expired entries
        self._prune_window(key, now)

        # Calculate current usage
        current_usage = sum(w for _, w in self._windows[key])

        # Check org-level rate limit (shared pool)
        org_usage = 0.0
        if org_id:
            org_key = f"org:{org_id}"
            self._prune_window(org_key, now)
            org_usage = sum(w for _, w in self._windows[org_key])
            org_limit = self.tier_limits.get("INSTITUTIONAL", 120) * 3  # Org pool is 3x individual

            if org_usage + weight > org_limit:
                self._violations[org_key] = self._violations.get(org_key, 0) + 1
                logger.warning(
                    f"RATE_LIMIT: Org {org_id} exceeded shared pool "
                    f"({org_usage:.0f}/{org_limit})"
                )
                return False, {
                    "limit": org_limit,
                    "remaining": max(0, org_limit - org_usage),
                    "reset": int(now + self.window_seconds),
                    "retry_after": self.window_seconds,
                    "scope": "organization",
                }

        # Check user-level rate limit
        if current_usage + weight > burst_limit:
            self._violations[key] = self._violations.get(key, 0) + 1
            logger.warning(
                f"RATE_LIMIT: User {user_id} exceeded burst limit "
                f"({current_usage:.0f}/{burst_limit})"
            )
            return False, {
                "limit": limit,
                "remaining": 0,
                "reset": int(now + self.window_seconds),
                "retry_after": self.window_seconds,
                "scope": "user",
            }

        # Record the request
        self._windows[key].append((now, weight))
        if org_id:
            self._windows[f"org:{org_id}"].append((now, weight))

        remaining = max(0, limit - (current_usage + weight))
        return True, {
            "limit": limit,
            "remaining": int(remaining),
            "reset": int(now + self.window_seconds),
            "scope": "user",
        }

    def get_violation_count(self, user_id: str) -> int:
        """Returns the number of rate limit violations for escalation logic."""
        return self._violations.get(f"user:{user_id}", 0)

    def reset_user(self, user_id: str) -> None:
        """Admin override to clear a user's rate limit window."""
        key = f"user:{user_id}"
        self._windows.pop(key, None)
        self._violations.pop(key, None)
        logger.info(f"RATE_LIMIT: Reset window for user {user_id}")


# Singleton instance
rate_limiter = SlidingWindowRateLimiter(
    default_rpm=int(os.getenv("RATE_LIMIT_RPM", "60")),
    burst_multiplier=float(os.getenv("RATE_LIMIT_BURST", "1.5")),
    window_seconds=int(os.getenv("RATE_LIMIT_WINDOW", "60")),
)
