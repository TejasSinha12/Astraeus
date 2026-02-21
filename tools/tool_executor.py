"""
Executes registered tools safely, catching errors and parsing responses.
"""
from typing import Any
import traceback

from tools.tool_registry import ToolRegistry
from core.decision_engine import ToolCallDecision
from utils.logger import logger

class ToolExecutor:
    """
    The sandbox layer sitting between the DecisionEngine's intent and actual system execution.
    Catches errors and routes standard string outputs back to ShortTermMemory.
    """

    def __init__(self, registry: ToolRegistry):
        self.registry = registry
        logger.info("ToolExecutor initialized.")

    async def execute(self, decision: ToolCallDecision) -> str:
        """
        Locates the requested tool, validates its arguments, executes it, and traps exceptions.

        Args:
            decision (ToolCallDecision): Emitted struct from Decision Engine.
        
        Returns:
            str: A formatted string representing the outcome, intended for ShortTermMemory ingestion.
        """
        tool = self.registry.get_tool(decision.tool_name)
        
        if not tool:
            err_msg = f"Execution Fault: Tool '{decision.tool_name}' not found in registry."
            logger.error(err_msg)
            return err_msg

        logger.info(f"Executing '{tool.name}' with args {decision.arguments}")
        
        try:
            # Pydantic validation of arguments before execution
            validated_args = tool.args_schema(**decision.arguments)
        except Exception as e:
            err_msg = f"Execution Fault: Argument Validation Failed for '{tool.name}': {e}"
            logger.error(err_msg)
            return err_msg

        try:
            # Fire tool
            # (In a true production environment, we might restrict runtime or use a secure sandbox here)
            result = await tool.execute(**validated_args.model_dump())
            
            # Coerce arbitrary results to string for short term memory ingestion
            output_str = f"Tool '{tool.name}' succeeded. Output:\n{str(result)}"
            logger.debug(f"Tool {tool.name} finished. Len(result)={len(str(result))}")
            return output_str

        except Exception as e:
            tb = traceback.format_exc()
            err_msg = f"Execution Fault: '{tool.name}' threw an internal exception during execution:\n{e}\nTraceback limit:\n{tb[-500:]}"
            logger.exception(err_msg)
            return err_msg
