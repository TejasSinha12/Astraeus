"""
Registry for available AGI tools.
"""
from typing import Dict, List, Any, Optional
from tools.base_tool import BaseTool
from utils.logger import logger

class ToolRegistry:
    """
    Maintains a dictionary of all active tools the AGI is permitted to use.
    Provides schemas to the decision engine.
    """

    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        logger.debug("ToolRegistry initialized.")

    def register(self, tool: BaseTool) -> None:
        """
        Adds a tool instance to the active registry.
        """
        if tool.name in self._tools:
            logger.warning(f"Tool `{tool.name}` is already registered. Overwriting.")
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")

    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        """
        Retrieves a loaded tool by its exact name.
        """
        return self._tools.get(tool_name)

    def get_all_schemas(self) -> List[Dict[str, Any]]:
        """
        Returns the formatted LLM dictionary representation for all registered tools.
        Used by DecisionEngine context building.
        """
        return [tool.get_llm_schema() for tool in self._tools.values()]
