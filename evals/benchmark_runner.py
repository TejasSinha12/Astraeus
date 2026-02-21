"""
Benchmark Runner Engine.
Executes dataset tests against a frozen iteration of the AGI to calculate scores.
"""
import os
import json
import asyncio
from typing import List, Dict
import time

from evals.benchmark_types import BenchmarkTask, BenchmarkResult, BenchmarkReport
from core.cognition import CognitionCore
from utils.logger import logger

class BenchmarkRunner:
    """
    Loads JSON datasets and runs the Cognition core against them measuring step length,
    reasoning string matches, and final goal completion.
    """

    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.tasks: List[BenchmarkTask] = self._load_dataset()
        self.agent_core = CognitionCore() # Spawns a clean brain instance
        logger.info(f"BenchmarkRunner initialized with {len(self.tasks)} test cases.")

    def _load_dataset(self) -> List[BenchmarkTask]:
        """Loads and parses the json test fixtures."""
        if not os.path.exists(self.dataset_path):
            logger.error(f"Dataset not found at {self.dataset_path}")
            return []
            
        with open(self.dataset_path, 'r') as f:
            raw_data = json.load(f)
            
        return [BenchmarkTask(**item) for item in raw_data]

    async def _evaluate_single_task(self, task: BenchmarkTask) -> BenchmarkResult:
        """
        Runs one test. (Currently mocked out as true execution requires fully written tools).
        """
        logger.info(f"Running Eval: [{task.category}] {task.id}")
        start_time = time.time()
        
        # MOCK EXECUTION (Integrating the real agent requires hooking into its async loop output)
        # await self.agent_core.execute_goal(task.prompt)
        await asyncio.sleep(0.5) 
        
        # MOCK RESULTS calculation
        success = True # Assume it works for the skeleton
        steps = 4 
        matched_paths = len(task.expected_reasoning_paths)
        reported_confidence = 0.85
        
        calc_error = (1.0 - reported_confidence) if success else reported_confidence
        
        return BenchmarkResult(
            task_id=task.id,
            category=task.category,
            success=success,
            steps_taken=steps,
            matched_reasoning_paths=matched_paths,
            total_reasoning_paths=len(task.expected_reasoning_paths),
            confidence_error=calc_error,
            raw_output=f"Task {task.id} mock output completed in {time.time()-start_time:.2f}s"
        )

    async def run_suite(self, version_hash: str) -> BenchmarkReport:
        """
        Fires all tests and returns the aggregate report.
        """
        logger.info(f"Starting Benchmark Suite run for layout version {version_hash}")
        
        results: List[BenchmarkResult] = []
        for task in self.tasks:
            res = await self._evaluate_single_task(task)
            results.append(res)
            
        # Aggregate
        total = len(results)
        if total == 0:
            raise ValueError("No tests to run.")
            
        successes = sum([1 for r in results if r.success])
        avg_steps = sum([r.steps_taken for r in results]) / total
        avg_conf_error = sum([r.confidence_error for r in results]) / total
        
        # Category breakdown
        cat_acc: Dict[str, float] = {}
        cats = set([r.category for r in results])
        for c in cats:
            c_res = [r for r in results if r.category == c]
            cat_acc[c] = sum([1 for r in c_res if r.success]) / len(c_res)
            
        report = BenchmarkReport(
            version_hash=version_hash,
            total_tasks=total,
            overall_accuracy=successes/total,
            category_accuracies=cat_acc,
            average_steps=avg_steps,
            average_confidence_error=avg_conf_error,
            results=results
        )
        
        logger.info(f"Suite completed. Accuracy: {report.overall_accuracy*100:.1f}%. Avg Calc Error: {report.average_confidence_error:.2f}")
        return report
