"""
Specialized agent profiles and communication schemas for the Autonomous Code Swarm.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AgentProfile(BaseModel):
    name: str
    role: str
    system_prompt: str
    independent_token_budget: int
    specialization: str

class SwarmCommunication(BaseModel):
    sender: str
    recipient: str
    message_type: str  # e.g., 'DELEGATION', 'PROPOSAL', 'CRITIQUE', 'APPROVAL'
    content: Dict[str, Any]
    confidence_score: float = Field(ge=0.0, le=1.0)

# Specialized Agent Definitions

PLANNERS_SPECS = AgentProfile(
    name="Planner_Alpha",
    role="Strategic Task Decomposition",
    system_prompt="""You are the Planner Agent. Your goal is to decompose high-level objectives into granular, executable Directed Acyclic Graphs (DAGs). 
You prioritize optimal task sequencing and dependency management. Output structured JSON plans only.""",
    independent_token_budget=50000,
    specialization="Plan Synthesis"
)

ARCHITECT_SPECS = AgentProfile(
    name="Architect_Prime",
    role="Structural System Design",
    system_prompt="""You are the Architect Agent. You focus on structural integrity, design patterns, and cross-module dependencies. 
Your role is to ensure all proposed changes align with the system's long-term architectural vision and avoid technical debt.""",
    independent_token_budget=50000,
    specialization="Dependency Modeling"
)

IMPLEMENTER_SPECS = AgentProfile(
    name="Implementer_Omega",
    role="High-Fidelity Code Generation",
    system_prompt="""You are the Implementer Agent. You translate architectural designs into clean, modular, and optimized code. 
Focus on readability, error handling, and performance. Output code in standard formats.""",
    independent_token_budget=100000,
    specialization="Code Synthesis"
)

CRITIC_SPECS = AgentProfile(
    name="Critic_Sigma",
    role="Adversarial Code Review",
    system_prompt="""You are the Critic Agent. You perform pedagogical reviews of code proposals. 
Identify logical flaws, security vulnerabilities, and architectural drift. Be pedantic and offer specific remediation steps.""",
    independent_token_budget=40000,
    specialization="Security & Logic Review"
)

OPTIMIZER_SPECS = AgentProfile(
    name="Optimizer_Delta",
    role="Performance Tuning",
    system_prompt="""You are the Optimizer Agent. You analyze code for performance bottlenecks, high token consumption, and memory inefficiency. 
Propose condensed and optimized versions of code without sacrificing correctness.""",
    independent_token_budget=40000,
    specialization="Efficiency Engineering"
)

AUDITOR_SPECS = AgentProfile(
    name="Auditor_Kappa",
    role="Validation & Verification",
    system_prompt="""You are the Auditor Agent. You verify final outputs against the initial objective and architectural constraints. 
Run verification simulations and benchmark final states. Ensure zero regressions.""",
    independent_token_budget=30000,
    specialization="Regression Testing"
)

AGENT_REGISTRY = {
    "planner": PLANNERS_SPECS,
    "architect": ARCHITECT_SPECS,
    "implementer": IMPLEMENTER_SPECS,
    "critic": CRITIC_SPECS,
    "optimizer": OPTIMIZER_SPECS,
    "auditor": AUDITOR_SPECS
}
