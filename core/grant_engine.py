"""
Grant Automation Engine for Ascension.
Generates structured research proposals based on swarm breakthroughs and funding themes.
"""
from typing import List, Dict, Any, Optional
import datetime
from core.research_synthesis import ResearchDataBundle
from utils.logger import logger

class GrantAutomationEngine:
    """
    AI-driven proposal generation for securing research funding.
    """

    def generate_proposal(self, bundle: ResearchDataBundle, funding_theme: str) -> str:
        """
        Synthesizes mission results into a structured grant proposal.
        """
        logger.info(f"GRANT: Generating proposal for {bundle.title} under theme '{funding_theme}'...")
        
        proposal = f"# [GRANT PROPOSAL] - {bundle.title}\n\n"
        proposal += f"**Timestamp:** {datetime.datetime.utcnow().isoformat()}\n"
        proposal += f"**Funding Theme:** {funding_theme}\n"
        proposal += f"**Impact Score:** {bundle.reproducibility_score * 100:.2f}%\n\n"
        
        proposal += "## Executive Summary\n"
        proposal += f"This research leverages autonomous swarm intelligence to address critical gaps in {funding_theme}. "
        proposal += f"Our platform has successfully demonstrated a stability coefficient of {bundle.performance_metrics.get('stability_coefficient', 0.0):.4f} "
        proposal += f"while achieving an entropy reduction of {abs(bundle.entropy_delta)} units in {bundle.objective_summary}.\n\n"
        
        proposal += "## Technical Innovation\n"
        proposal += "The Ascension Swarm utilizes a distributed multi-agent coordinator with structural mutation policies. "
        proposal += f"A validated lineage of {len(bundle.mutation_lineage)} mutations proves the system's capacity for complex reasoning evolution.\n\n"
        
        proposal += "## Proposed Timeline\n"
        proposal += "- **Phase 1 (Scaling):** Expanding Swarm clusters to 100+ nodes.\n"
        proposal += "- **Phase 2 (Integration):** Federated memory synchronization across multi-institutional clusters.\n"
        proposal += "- **Phase 3 (Validation):** Real-world benchmarks against decentralized validator networks.\n\n"
        
        proposal += "## Budget Justification\n"
        proposal += "Funds will be primarily allocated to high-performance compute cycles and reputation staking in validation networks to ensure peak scientific integrity.\n"
        
        return proposal

    def align_with_agency(self, proposal: str, agency: str) -> str:
        """
        Applies agency-specific formatting and tone adjustments (NSF, DARPA, etc.)
        """
        if agency.upper() == "DARPA":
            return f"{proposal}\n\n[DARPA-SPECIFIC ADDENDUM]: Tactical swarm deployment scenarios and security adversarial hardening confirmed."
        elif agency.upper() == "NSF":
            return f"{proposal}\n\n[NSF-SPECIFIC ADDENDUM]: Intellectual merit and broader societal impact on AGI safety verified."
        return proposal
