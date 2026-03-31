import asyncio
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import json
from core.reasoning_engine import ReasoningEngine

logger = logging.getLogger(__name__)

class FailureAnalysis(BaseModel):
    is_recoverable: bool
    error_type: str
    root_cause: str
    suggested_correction: str
    confidence_in_fix: float

class RecoveryEngine:
    """
    Handles autonomous failure analysis and proposes corrective actions
    for failed swarm mission steps.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None, reasoning_engine: Optional[ReasoningEngine] = None):
        self.config = config or {}
        self.max_corrective_depth = self.config.get("max_corrective_depth", 3)
        self.recovery_threshold = self.config.get("recovery_threshold", 0.7)
        self.llm_engine = reasoning_engine or ReasoningEngine()

    async def analyze_failure(self, step_data: Dict[str, Any], error_msg: str) -> FailureAnalysis:
        """
        Analyzes a failed step to determine if it's recoverable and how.
        """
        logger.info(f"RECOVERY: Analyzing failure in step {step_data.get('status', 'unknown')} with LLM Diagnostic")
        
        system_prompt = (
            "You are the Astraeus Autonomous Recovery Auditor. Analyze the failure context and determine "
            "if the mission step is recoverable. Return a structured JSON response matching the FailureAnalysis schema."
        )
        user_prompt = f"Step Data Context: {json.dumps(step_data)}\nError Message Received: {error_msg}"
        
        try:
            analysis_result = await self.llm_engine.generate_response(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.2,
                response_model=FailureAnalysis
            )
            logger.info(f"RECOVERY: LLM Root Cause identified: {analysis_result.error_type}")
            return analysis_result
        except Exception as e:
            logger.error(f"RECOVERY: LLM diagnostic failed ({e}). Falling back to heuristic recovery.")
            # Fallback heuristic
            is_recoverable = True
            error_type = "LOGIC_ERROR"
            
            if "timeout" in error_msg.lower() or "connection" in error_msg.lower():
                error_type = "INFRASTRUCTURE_ERROR"
                root_cause = "Network latency or service unavailability during reasoning."
                suggested_correction = "Retry with increased timeout and specific model fallback."
            elif "undefined" in error_msg.lower() or "missing" in error_msg.lower():
                error_type = "DEPENDENCY_ERROR"
                root_cause = "Referenced variable or module not found in context."
                suggested_correction = "Re-index codebase and inject missing definitions into context."
            else:
                root_cause = "Divergence between plan and implementation detected by auditor."
                suggested_correction = "Regenerate implementation step with stricter policy enforcement."

            return FailureAnalysis(
                is_recoverable=is_recoverable,
                error_type=error_type,
                root_cause=root_cause,
                suggested_correction=suggested_correction,
                confidence_in_fix=0.85 if is_recoverable else 0.2
            )

    async def generate_recovery_prompt(self, analysis: FailureAnalysis, failed_prompt: str) -> str:
        """
        Wraps the original prompt with diagnostic context for a corrective sub-swarm.
        """
        return (
            f"AUTONOMOUS RECOVERY PROTOCOL ALPHA v5.2.4\n"
            f"FAILURE TYPE: {analysis.error_type}\n"
            f"ROOT CAUSE: {analysis.root_cause}\n"
            f"CORRECTION: {analysis.suggested_correction}\n\n"
            f"ORIGINAL TASK:\n{failed_prompt}\n\n"
            f"Please execute the task again, specifically addressing the root cause identified above."
        )
