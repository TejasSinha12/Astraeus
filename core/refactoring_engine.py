"""
Self-Refactoring Engine for Project Ascension.
Analyzes the codebase for architectural drift and complexity, then triggers swarm-led improvements.
"""
import ast
import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.code_intelligence import CodeIntelligence
from core.swarm_orchestrator import SwarmOrchestrator
from utils.logger import logger

class RefactorProposal(BaseModel):
    target_file: str
    issue_type: str # e.g., 'HIGH_COMPLEXITY', 'REDUNDANT_ABSTRACTION', 'CIRCULAR_DEP'
    confidence: float
    reasoning: str
    proposed_action: str

class RefactoringEngine:
    """
    Automated discovery and resolution of architectural weaknesses.
    """

    def __init__(self, orchestrator: SwarmOrchestrator):
        self.orchestrator = orchestrator
        self.intelligence = CodeIntelligence()
        logger.info("Self-Refactoring Engine initialized.")

    async def scan_and_evolve(self, target_dir: str = ".") -> List[RefactorProposal]:
        """
        Scans a directory, identifies weaknesses, and runs the swarm to fix them.
        """
        logger.info(f"Evolutionary scan initiated on: {target_dir}")
        
        # 1. Structural Analysis
        proposals = self._analyze_structure(target_dir)
        
        if not proposals:
            logger.info("No critical architectural weaknesses identified in this cycle.")
            return []

        # 2. Sequential Evolution (One refinement at a time for safety)
        for proposal in proposals:
            if proposal.confidence > 0.8:
                logger.warning(f"HIGH CONFIDENCE WEAKNESS DETECTED: {proposal.issue_type} in {proposal.target_file}")
                await self._execute_refactor(proposal)
        
        return proposals

    def _analyze_structure(self, directory: str) -> List[RefactorProposal]:
        """
        Deep scan using AST to find hotspots.
        (Placeholder for full graph logic - currently focuses on complexity)
        """
        proposals = []
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith(".py"):
                    path = os.path.join(root, file)
                    metrics = self.intelligence.parse_file(path)
                    
                    if metrics and metrics.get("complexity", 0) > 15:
                        proposals.append(RefactorProposal(
                            target_file=path,
                            issue_type="HIGH_COMPLEXITY",
                            confidence=0.95,
                            reasoning=f"Complexity score {metrics['complexity']} exceeds threshold (15).",
                            proposed_action="Decompose monolithic functions into atomic units."
                        ))
        return proposals

    async def _execute_refactor(self, proposal: RefactorProposal) -> None:
        """
        Hooks into the Swarm Orchestrator to solve the identified weakness.
        """
        context = f"File: {proposal.target_file}\nIssue: {proposal.issue_type}\nReason: {proposal.reasoning}"
        objective = f"Refactor the file {proposal.target_file} to resolve {proposal.issue_type}. Objective: {proposal.proposed_action}"
        
        logger.info(f"Triggering Swarm Refactor for: {proposal.target_file}")
        
        # Swarm takes over the execution
        await self.orchestrator.execute_swarm_objective(objective)
        
        logger.info(f"Autonomous evolution complete for: {proposal.target_file}")
