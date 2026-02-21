"""
LLM abstraction layer and reasoning context engine.
Handles generic inference requests against language models and enforces strict responses.
"""
from typing import List, Dict, Any, Optional
import openai
from pydantic import BaseModel, ValidationError

from core_config import config
from utils.logger import logger
from core.token_controller import TokenController


class ReasoningEngine:
    """
    Abastraction layer for interacting with Large Language Models.
    Ensures structured parsing via Pydantic when expected.
    """

    def __init__(self):
        """
        Initializes the Reasoning Engine. Uses openai SDK by default.
        Requires configuration of API keys.
        """
        self.client = None
        if not config.USE_MOCK:
            if not config.OPENAI_API_KEY:
                logger.warning("OPENAI_API_KEY is missing. Falling back to simulation mode.")
                config.USE_MOCK = True
            
            # Note: We still initialize a client skeleton if mock is on for architecture consistency
            self.client = openai.AsyncOpenAI(api_key=config.OPENAI_API_KEY or "dummy")
            
        self.model = config.DEFAULT_MODEL
        self.tokens = TokenController(model_name=self.model)
        self.system_prompt: str = "You are a helpful AGI core."
        logger.info(f"ReasoningEngine initialized with model: {self.model} (MockMode: {config.USE_MOCK})")

    async def generate_response(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.5,
        response_model: Optional[type[BaseModel]] = None
    ) -> Any:
        """
        Generates a response from the LLM, optionally constrained to a Pydantic schema.

        Args:
            system_prompt (str): High-level system instructions.
            user_prompt (str): Task execution input.
            temperature (float): The reasoning temperature (hallucination variable).
            response_model (Optional[type[BaseModel]]): A Pydantic model type to parse the output against.

        Returns:
            Any: A string if response_model is None, else a parsed Pydantic instance.
        """
        messages = [
            {"role": "system", "content": system_prompt or self.system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            # Bypass limit check and generation if in mock mode
            if config.USE_MOCK:
                return await self._generate_mock_response(user_prompt, response_model)

            # Enforce token limit check before generation
            if not self.tokens.check_limit():
                raise RuntimeError("Token limit reached. Aborting generation.")

            # Standard text generation
            if response_model is None:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                )
                content = response.choices[0].message.content
                # Track usage
                usage = response.usage.total_tokens if response.usage else self.tokens.count_tokens(content)
                self.tokens.track_usage(usage)
                return content

            # Structured JSON parsing
            else:
                response = await self.client.beta.chat.completions.parse(
                    model=self.model,
                    messages=messages,
                    response_format=response_model,
                    temperature=temperature,
                )
                parsed_response = response.choices[0].message.parsed
                if parsed_response is None:
                    raise ValueError("Model failed to adhere to the required JSON schema.")
                
                # Track usage
                usage = response.usage.total_tokens if hasattr(response, 'usage') and response.usage else self.tokens.count_tokens(str(parsed_response))
                self.tokens.track_usage(usage or 0)
                
                return parsed_response

        except Exception as e:
            logger.error(f"ReasoningEngine failed during generation: {e}")
            raise RuntimeError(f"Engine generation error: {e}")


    async def _generate_mock_response(self, prompt: str, response_model: Optional[type[BaseModel]]) -> Any:
        """
        Generates deterministic simulation responses for local testing without API keys.
        """
        logger.debug(f"MOCK SIMULATION -> Generating response for prompt: {prompt[:50]}...")
        
        # Mocking for DecisionEngine (NextAction)
        if response_model and response_model.__name__ == "NextAction":
            from core.decision_engine import NextAction, ToolCallDecision
            
            # Use 'TASK_COMPLETE' if we detect this is not the first time we've seen this task in context
            # or if certain keywords are present.
            is_refined_prompt = "Refinement" in prompt or "Critique" in prompt or "Recent Context / Memory" in prompt
            
            if is_refined_prompt:
                return NextAction(
                    thought_process="The code has survived multi-pass refinement and satisfy all structural constraints.",
                    confidence_score=0.95,
                    action_type="TASK_COMPLETE", 
                    response_or_summary="The code has been successfully refined and optimized for structural integrity."
                )
            
            # Use mock tool if it's an initial step
            return NextAction(
                thought_process="Initializing the development environment by verifying sandbox connectivity.",
                confidence_score=0.9,
                action_type="USE_TOOL",
                tool_call=ToolCallDecision(tool_name="python_execution", arguments={"code": "print('Mock initialization execution successful.')"})
            )

        # Mocking for GoalPlanner (Plan)
        if response_model and response_model.__name__ == "Plan":
            from core.goal_planner import Plan, TaskDefinition
            return Plan(
                plan_overview="Simulation Plan: Analyze, Implement, and Refine.",
                tasks=[
                    TaskDefinition(id="sim_1", description="Analyze structural dependencies", dependencies=[], expected_outcome="AST metadata extracted"),
                    TaskDefinition(id="sim_2", description="Implement refined logic", dependencies=["sim_1"], expected_outcome="Optimized code produced")
                ]
            )

        # Mocking for RefinementLoop (Text)
        if "structural analysis" in prompt.lower():
            return "ANALYSIS: Structural dependencies identified. Complexity is within manageable bounds."
        if "optimized code" in prompt.lower() or "generate a robust" in prompt.lower():
            return "def optimized_func():\n    return 'Refined Simulation Result'\n"
        
        # Generic fallback
        return "Simulation Response: The AGI is currently operating in local mock mode for demonstration."
