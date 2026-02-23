"""
Validation Reporter for Project Ascension.
Generates post-evolution reports comparing predicted vs. actual intelligence deltas.
"""
import json
import os
from typing import Dict, Any
from pydantic import BaseModel
from utils.logger import logger

class ValidationReport(BaseModel):
    experiment_id: str
    hypothesis_predicted: float
    actual_delta: float
    calibration_error: float
    statistical_significance: bool
    verdict: str # 'LEGITIMATE', 'DRIFT', 'NO_GAIN'

class ValidationReporter:
    """
    Analytical engine for auditing evolutionary legitimacy.
    """

    def __init__(self, report_dir: str = "evals/reports"):
        self.report_dir = report_dir
        os.makedirs(self.report_dir, exist_ok=True)
        logger.info("ValidationReporter initialized.")

    def generate_report(self, experiment_id: str, predicted: float, actual: float) -> ValidationReport:
        """
        Computes the delta and calibration accuracy of a completed experiment.
        """
        error = abs(predicted - actual)
        
        # A change is 'legitimate' if the gain is positive and the prediction wasn't wildly off
        is_legit = (actual > 0) and (error < abs(predicted) * 1.5)
        
        report = ValidationReport(
            experiment_id=experiment_id,
            hypothesis_predicted=predicted,
            actual_delta=actual,
            calibration_error=error,
            statistical_significance=actual > 0.01, # Simplified threshold
            verdict="LEGITIMATE" if is_legit else "DRIFT"
        )
        
        path = os.path.join(self.report_dir, f"{experiment_id}_report.json")
        with open(path, "w") as f:
            f.write(report.model_dump_json(indent=2))
            
        logger.info(f"VALIDATION REPORT GENERATED: {experiment_id} (Verdict: {report.verdict})")
        return report
