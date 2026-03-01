"""
Research Compiler for Ascension.
Transforms ResearchDataBundles into formal academic reports (Markdown, LaTeX, JSON).
"""
from typing import Dict, Any, List
import json
import hashlib
from core.research_synthesis import ResearchDataBundle
from utils.logger import logger

class ResearchCompiler:
    """
    Formal formatting engine for AGI research artifacts.
    """

    def compile_to_markdown(self, bundle: ResearchDataBundle) -> str:
        """
        Generates a structured Markdown report from a research bundle.
        """
        logger.info(f"COMPILER: Formatting {bundle.title} to Markdown...")
        
        md = f"# {bundle.title}\n\n"
        md += "## Abstract\n"
        md += f"This report documents an autonomous evolutionary cycle targeting the objective: '{bundle.objective_summary}'. "
        md += f"The process resulted in an entropy reduction of {bundle.entropy_delta} units with a stability coefficient of {bundle.performance_metrics.get('stability_coefficient')}.\n\n"
        
        md += "## Methodology\n"
        md += "The swarm utilized a distributed multi-agent coordinator with structural mutation policies. "
        md += f"A total of {len(bundle.telemetry_logs)} missions were executed in this cycle.\n\n"
        
        md += "## Results & Performance\n"
        md += "| Metric | Value |\n"
        md += "| --- | --- |\n"
        for k, v in bundle.performance_metrics.items():
            md += f"| {k.replace('_', ' ').title()} | {v:.4f} |\n"
        
        md += "\n## Mutation Lineage Tree\n"
        md += "```mermaid\ngraph TD\n"
        for link in bundle.mutation_lineage:
            md += f"  {link}\n"
        md += "```\n\n"
        
        md += "## Reproducibility Annex\n"
        md += f"**Confidence Score:** {bundle.reproducibility_score:.2f}\n"
        md += "Full telemetry logs are available for sandboxed replay in the attached JSON dossier.\n"
        
        return md

    def generate_dossier_json(self, bundle: ResearchDataBundle) -> str:
        """
        Generates a machine-readable JSON dossier for integrity verification.
        """
        dossier = bundle.dict()
        dossier["integrity_signature"] = self._sign_data(dossier)
        return json.dumps(dossier, indent=2)

    def _sign_data(self, data: Dict[str, Any]) -> str:
        """
        Simple cryptographic signature for the dossier.
        """
        dump = json.dumps(data, sort_keys=True)
        return hashlib.sha256(dump.encode()).hexdigest()

    def compile_to_latex(self, bundle: ResearchDataBundle) -> str:
        """
        Generates LaTeX source for high-fidelity PDF output.
        """
        # Simplified LaTeX mock
        latex = "\\documentclass{article}\n\\begin{document}\n"
        latex += f"\\title{{{bundle.title}}}\n\\maketitle\n"
        latex += "\\section{Abstract}\n"
        latex += f"Autonomous research cycle for {bundle.objective_summary}.\n"
        latex += "\\section{Methodology}\n"
        latex += f"Utilized {len(bundle.telemetry_logs)} swarm missions.\n"
        latex += "\\end{document}\n"
        return latex
