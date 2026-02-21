"""
Abstract protocol for AGI Tools.
Forces tools to define their schemas clearly for LLM ingestion.
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Type
from pydantic import BaseModel
import inspect

class BaseTool(ABC):
    """
    Abstract Base Class for all tools the AGI can invoke.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """The exact name the Decision Engine must emit to use this tool."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """A detailed explanation of when and why to use this tool."""
        pass

    @property
    @abstractmethod
    def args_schema(self) -> Type[BaseModel]:
        """A Pydantic BaseModel class representing the expected kwargs."""
        pass

    @abstractmethod
    async def execute(self, **kwargs) -> Any:
        """
        The actual execution logic. 
        Will receive valid kwargs according to `args_schema`.
        """
        pass

    def get_llm_schema(self) -> Dict[str, Any]:
        """
        Compiles the tool definition into a format the DecisionEngine can parse.
        """
        return {
            "name": self.name,
            "description": self.description,
            "schema": self.args_schema.model_json_schema()
        }
