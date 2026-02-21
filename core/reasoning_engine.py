"""
LLM abstraction layer and reasoning context engine.
Handles generic inference requests against language models and enforces strict responses.
"""
from typing import List, Dict, Any, Optional
import openai
from pydantic import BaseModel, ValidationError

from core_config import config
from utils.logger import logger


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
        if not config.OPENAI_API_KEY:
            logger.warning("OPENAI_API_KEY is missing. ReasoningEngine will fail attempting inference.")
        
        self.client = openai.AsyncOpenAI(api_key=config.OPENAI_API_KEY)
        self.model = config.DEFAULT_MODEL
        logger.info(f"ReasoningEngine initialized with model: {self.model}")

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
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            # Simple text generation
            if response_model is None:
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    temperature=temperature,
                )
                return response.choices[0].message.content

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
                return parsed_response

        except Exception as e:
            logger.error(f"ReasoningEngine failed during generation: {e}")
            raise RuntimeError(f"Engine generation error: {e}")
