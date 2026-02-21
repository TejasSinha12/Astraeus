"""
Token budget controller and context optimizer.
Manages token limits, estimates usage, and enforces hierarchical context compression.
"""
import tiktoken
from typing import List, Dict, Any, Optional
from core_config import config
from utils.logger import logger

class TokenController:
    """
    Manages the lifecycle of token usage for the AGI core.
    Enforces hard limits and tracks cognitive bandwidth.
    """

    def __init__(self, model_name: str = config.DEFAULT_MODEL):
        self.model_name = model_name
        try:
            self.encoding = tiktoken.encoding_for_model(model_name)
        except KeyError:
            logger.warning(f"Model {model_name} not found in tiktoken, falling back to cl100k_base.")
            self.encoding = tiktoken.get_encoding("cl100k_base")
            
        self.global_usage = 0
        self.task_usage = 0
        self.bandwidth_scores: List[float] = []

    def count_tokens(self, text: str) -> int:
        """Counts tokens in a string."""
        return len(self.encoding.encode(text))

    def reset_task_usage(self):
        """Resets the usage counter for a new individual task."""
        self.task_usage = 0

    def track_usage(self, tokens: int):
        """Logs tokens consumed by a generation step."""
        self.global_usage += tokens
        self.task_usage += tokens
        
        # Log usage to telemetry
        logger.debug(f"Token Consumption -> Step: {tokens} | Task: {self.task_usage}/{config.TASK_TOKEN_LIMIT} | Global: {self.global_usage}")

    def get_bandwidth_score(self) -> float:
        """
        Calculates the Cognitive Bandwidth Score:
        1.0 - (current_task_usage / task_limit)
        """
        if config.TASK_TOKEN_LIMIT <= 0:
            return 1.0
        score = max(0.0, 1.0 - (self.task_usage / config.TASK_TOKEN_LIMIT))
        self.bandwidth_scores.append(score)
        return score

    def check_limit(self, estimated_next_tokens: int = 0) -> bool:
        """Verifies if the next generation would exceed local or global limits."""
        if (self.task_usage + estimated_next_tokens) > config.TASK_TOKEN_LIMIT:
            logger.error(f"Task token limit exceeded: {self.task_usage} tokens.")
            return False
        if (self.global_usage + estimated_next_tokens) > config.GLOBAL_TOKEN_BUDGET:
            logger.error(f"Global token budget exhausted: {self.global_usage} tokens.")
            return False
        return True

    def optimize_context(self, components: Dict[str, str], max_tokens: int) -> str:
        """
        Hierarchically compresses context based on priority.
        Priority: Goal > Task (Immediate) > Short Memory > Long Memory
        """
        current_context = ""
        # component_keys follows config.CONTEXT_PRIORITY
        for key in config.CONTEXT_PRIORITY:
            content = components.get(key, "")
            if not content:
                continue
                
            proposed_content = f"[{key.upper()}]\n{content}\n"
            current_tokens = self.count_tokens(current_context + proposed_content)
            
            if current_tokens > max_tokens:
                # If we're over, we attempt to truncate or skip this component
                # Note: 'goal' and 'task' are usually protected from truncation in high-budget scenarios
                if key in ["goal", "task"]:
                    # Forced inclusion for critical items
                    current_context += proposed_content
                else:
                    logger.warning(f"Context overflow. Skipping component: {key}")
            else:
                current_context += proposed_content
                
        return current_context
