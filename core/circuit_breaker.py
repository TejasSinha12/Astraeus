"""
Circuit Breaker for Astraeus Swarm Execution.
Prevents cascading failures by tracking error rates and automatically
opening the circuit when failure thresholds are exceeded.

States:
  CLOSED   -> Normal operation, requests pass through
  OPEN     -> Failures exceeded threshold, requests are rejected immediately
  HALF_OPEN -> Testing recovery, limited requests pass through
"""
import time
import enum
from typing import Dict, Optional
from utils.logger import logger


class CircuitState(enum.Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreaker:
    """
    Per-service circuit breaker with automatic state transitions.
    """

    def __init__(
        self,
        service_name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        half_open_max_calls: int = 2,
    ):
        self.service_name = service_name
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time: float = 0.0
        self._half_open_calls = 0

        logger.info(
            f"CIRCUIT_BREAKER: [{service_name}] initialized "
            f"(threshold={failure_threshold}, recovery={recovery_timeout}s)"
        )

    @property
    def state(self) -> CircuitState:
        """Returns current state, auto-transitioning OPEN -> HALF_OPEN on timeout."""
        if self._state == CircuitState.OPEN:
            elapsed = time.time() - self._last_failure_time
            if elapsed >= self.recovery_timeout:
                self._state = CircuitState.HALF_OPEN
                self._half_open_calls = 0
                logger.info(
                    f"CIRCUIT_BREAKER: [{self.service_name}] OPEN -> HALF_OPEN "
                    f"(recovery timeout elapsed)"
                )
        return self._state

    def allow_request(self) -> bool:
        """Check if a request should be allowed through."""
        current = self.state

        if current == CircuitState.CLOSED:
            return True

        if current == CircuitState.HALF_OPEN:
            if self._half_open_calls < self.half_open_max_calls:
                self._half_open_calls += 1
                return True
            return False

        # OPEN
        return False

    def record_success(self) -> None:
        """Record a successful request."""
        if self._state == CircuitState.HALF_OPEN:
            self._success_count += 1
            if self._success_count >= self.half_open_max_calls:
                self._state = CircuitState.CLOSED
                self._failure_count = 0
                self._success_count = 0
                logger.info(
                    f"CIRCUIT_BREAKER: [{self.service_name}] HALF_OPEN -> CLOSED "
                    f"(recovery confirmed)"
                )
        elif self._state == CircuitState.CLOSED:
            # Decay failure count on success
            self._failure_count = max(0, self._failure_count - 1)

    def record_failure(self) -> None:
        """Record a failed request."""
        self._failure_count += 1
        self._last_failure_time = time.time()

        if self._state == CircuitState.HALF_OPEN:
            # Immediate trip back to OPEN
            self._state = CircuitState.OPEN
            self._success_count = 0
            logger.warning(
                f"CIRCUIT_BREAKER: [{self.service_name}] HALF_OPEN -> OPEN "
                f"(recovery failed)"
            )
        elif (
            self._state == CircuitState.CLOSED
            and self._failure_count >= self.failure_threshold
        ):
            self._state = CircuitState.OPEN
            logger.error(
                f"CIRCUIT_BREAKER: [{self.service_name}] CLOSED -> OPEN "
                f"(failures={self._failure_count}/{self.failure_threshold})"
            )

    def get_diagnostics(self) -> Dict:
        """Returns circuit health diagnostics for the admin dashboard."""
        return {
            "service": self.service_name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "failure_threshold": self.failure_threshold,
            "recovery_timeout": self.recovery_timeout,
            "last_failure": self._last_failure_time,
        }


class CircuitBreakerRegistry:
    """
    Global registry of per-service circuit breakers.
    """

    def __init__(self):
        self._breakers: Dict[str, CircuitBreaker] = {}

    def get_or_create(
        self,
        service_name: str,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
    ) -> CircuitBreaker:
        if service_name not in self._breakers:
            self._breakers[service_name] = CircuitBreaker(
                service_name=service_name,
                failure_threshold=failure_threshold,
                recovery_timeout=recovery_timeout,
            )
        return self._breakers[service_name]

    def get_all_diagnostics(self) -> list:
        return [cb.get_diagnostics() for cb in self._breakers.values()]


# Singleton registry
circuit_registry = CircuitBreakerRegistry()
