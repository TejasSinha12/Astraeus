"""
Pre-configured Agent Profiles for Project Ascension.
Each agent receives a distinct system prompt and limited tool subset to prevent context pollution.
"""
from typing import List

from agents.autonomous_agent import AutonomousAgent
from tools.web_search_tool import WebSearchTool
from tools.file_system_tool import FileSystemTool
from tools.code_execution_tool import CodeExecutionTool

def create_researcher_agent(agent_id: str = "Researcher_01") -> AutonomousAgent:
    """
    Focused strictly on gathering information from the internet and summarizing it.
    Has no write access or code execution capability.
    """
    agent = AutonomousAgent(
        agent_id=agent_id,
        role="Senior Research Analyst"
    )
    # The agent's cognition core is accessible via agent.core
    agent.core.tool_registry.register(WebSearchTool())
    
    agent.core.reasoning.system_prompt += (
        "\n\nROLE OVERRIDE: You are a Research Analyst. Your sole job is to ingest queries, "
        "exhaustively use the `web_search` tool to find ground truth data, and then return "
        "a highly detailed, structured summary as a TASK_COMPLETE action."
    )
    return agent

def create_coder_agent(agent_id: str = "Coder_01", sandbox_dir: str = ".") -> AutonomousAgent:
    """
    Has full access to the file system and Python execution environment.
    """
    agent = AutonomousAgent(
        agent_id=agent_id,
        role="Lead Software Engineer"
    )
    agent.core.tool_registry.register(FileSystemTool(sandbox_dir=sandbox_dir))
    agent.core.tool_registry.register(CodeExecutionTool())
    
    agent.core.reasoning.system_prompt += (
        "\n\nROLE OVERRIDE: You are a Lead Software Engineer specialized in Structural Reasoning. "
        "Your job is to analyze code architecture using AST metadata, optimize for token efficiency, "
        "and implement robust, modular software. Always reason about structural dependencies "
        "and complexity before implementation. Your responses will undergo a multi-pass "
        "iterative refinement loop for maximum quality and minimal tokens."
    )
    return agent

def create_executive_agent(agent_id: str = "Executive_Alpha", child_agents: List[str] = None) -> AutonomousAgent:
    """
    The orchestrator. It doesn't do the work itself; it builds the goal plan and delegates.
    Requires integration with the MultiAgentCoordinator via custom tools in a full deployment.
    """
    agent = AutonomousAgent(
        agent_id=agent_id,
        role="AGI Swarm Executive Orchestrator"
    )
    
    available_children = ", ".join(child_agents) if child_agents else "None"
    
    agent.core.reasoning.system_prompt += (
        "\n\nROLE OVERRIDE: You are the Swarm Executive. Do not write code or search the web directly. "
        "Your job is to break complex, ambiguous user requests into distinct subgoals and assign them "
        "to the specialist agents. \n"
        f"Available Sub-Agents: [{available_children}]"
    )
    return agent
