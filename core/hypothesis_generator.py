"""
Hypothesis Generator for Ascension.
Identifies performance inflection points and specialization trends to propose new research questions.
"""
from typing import List, Dict, Any
from core.research_synthesis import ResearchDataBundle
from utils.logger import logger

class HypothesisGenerator:
    """
    Proactive research discovery engine.
    Analyzes telemetry to suggest the 'next step' in intelligence evolution.
    """

    def generate_hypotheses(self, bundle: ResearchDataBundle) -> List[str]:
        """
        Analyzes performance metrics to produce text-based hypotheses.
        """
        logger.info(f"HYPOTHESIS: Analyzing inflection points in {bundle.title}...")
        
        hypotheses = []
        
        # 1. Analyze Stability vs Depth
        depth = bundle.performance_metrics.get("reasoning_depth_avg", 0.0)
        stability = bundle.performance_metrics.get("stability_coefficient", 0.0)
        
        if depth > 4.0 and stability < 0.90:
            hypotheses.append("Hypothesis: Increasing reasoning depth beyond 4 cycles introduces structural instability in the decision graph.")
        elif depth < 3.0 and stability > 0.95:
            hypotheses.append("Hypothesis: Shallow reasoning cycles (depth < 3) optimize for stability at the cost of cognitive breakthrough potential.")
            
        # 2. Analyze Efficiency
        efficiency = bundle.performance_metrics.get("avg_token_efficiency", 0.0)
        if efficiency < 0.70:
            hypotheses.append("Hypothesis: High communication overhead between specialized agents is the primary bottleneck for token efficiency.")
        
        # 3. Analyze Lineage Complexity
        lineage_count = len(bundle.mutation_lineage)
        if lineage_count > 10:
            hypotheses.append("Hypothesis: Evolutionary convergence slows significantly after 10 mutation cycles due to overfitting on the initial objective.")

        logger.info(f"HYPOTHESIS: Generated {len(hypotheses)} research directions.")
        return hypotheses
