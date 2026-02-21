"""
Benchmark Runner for Project Ascension.
Defines typed models for running standardized datasets against the Agent.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class BenchmarkTask(BaseModel):
    """
    A single deterministic test case for the AGI.
    """
    id: str = Field(description="Unique identifier for the benchmark.")
    category: str = Field(description="Logical reasoning, planning, math, tool_use, etc.")
    prompt: str = Field(description="The exact prompt to feed the agent.")
    expected_reasoning_paths: List[str] = Field(description="Substrings the engine MUST generate in its `thought_process`.")
    expected_answer: str = Field(description="The deterministic end state requirement.")

class BenchmarkResult(BaseModel):
    """
    The calculated performance of the Agent against a BenchmarkTask.
    """
    task_id: str
    category: str
    success: bool
    steps_taken: int
    matched_reasoning_paths: int
    total_reasoning_paths: int
    confidence_error: float # (1.0 - reported_confidence) if success=True else (reported_confidence)
    raw_output: str
    
class BenchmarkReport(BaseModel):
    """
    The aggregated result of a full suite run.
    """
    version_hash: str
    total_tasks: int
    overall_accuracy: float
    category_accuracies: Dict[str, float]
    average_steps: float
    average_confidence_error: float # Closer to 0 is perfectly calibrated.
    results: List[BenchmarkResult]
