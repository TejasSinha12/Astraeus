"""
Sandbox manager integrating constraints and ethics before tool execution.
"""
from core.decision_engine import ToolCallDecision
from core.reasoning_engine import ReasoningEngine

from safety.constraints import SystemConstraints
from safety.ethical_layer import EthicalLayer, EthicalCheck
from utils.logger import logger

class Sandbox:
    """
    Wrap tool executions in this layer to strictly enforce all security and ethical bounds
    before allowing the ToolExecutor to act.
    """

    def __init__(self, engine: ReasoningEngine):
        self.ethical_layer = EthicalLayer(engine)
        logger.info("Sandbox operational.")

    async def validate_intended_execution(
        self, 
        decision: ToolCallDecision, 
        task_context: str
    ) -> bool:
        """
        Runs the full suite of security and ethical checks on a proposed tool call.
        """
        # 1. Hardcoded Rules (File access, regexes)
        if decision.tool_name == "shell_execute":
            cmd = decision.arguments.get("command", "")
            if not SystemConstraints.check_command_safety(cmd):
                return False
                
        if decision.tool_name in ["read_file", "write_file"]:
            path = decision.arguments.get("path", "")
            if not SystemConstraints.validate_file_access(path):
                return False

        # 2. Heuristic / LLM Ethical rules
        # Format the arguments into a readable string for the ethical judge
        action_desc = f"Use tool '{decision.tool_name}' with args {decision.arguments}"
        
        check: EthicalCheck = await self.ethical_layer.evaluate_action(
            action_description=action_desc,
            task_context=task_context
        )
        
        return check.is_safe
