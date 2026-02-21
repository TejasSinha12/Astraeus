"""
Ethical validation layer using secondary LLM moderation.
"""
from typing import Optional
from pydantic import BaseModel, Field

from core.reasoning_engine import ReasoningEngine
from utils.logger import logger

class EthicalCheck(BaseModel):
    is_safe: bool = Field(description="True if the action aligns with ethical guidelines.")
    violation_reason: Optional[str] = Field(description="Populated if is_safe is False.")

class EthicalLayer:
    """
    Passes proposed high-impact actions through a separate, constrained LLM check 
    to prevent harmful or malicious behavior.
    """

    def __init__(self, engine: ReasoningEngine):
        self.engine = engine
        logger.info("EthicalLayer initialized.")

    async def evaluate_action(self, action_description: str, task_context: str) -> EthicalCheck:
        """
        Checks if an intended action violates alignment rules.
        """
        sys_prompt = (
            "You are the Ethical Firewall for an AGI system.\n"
            "Review the proposed action in the context of the user's task. "
            "Flag the action as unsafe ONLY if it promotes physical harm, illegal acts, "
            "severe privacy violations, or attempts to manipulate human operators maliciously."
        )

        user_prompt = f"Context:\n{task_context}\n\nProposed Action:\n{action_description}"

        logger.debug(f"Running ethical evaluation on: {action_description[:50]}...")
        result = await self.engine.generate_response(
            system_prompt=sys_prompt,
            user_prompt=user_prompt,
            temperature=0.0,
            response_model=EthicalCheck
        )

        if not result.is_safe:
            logger.critical(f"ETHICAL VIOLATION PREVENTED: {result.violation_reason}")
            
        return result
