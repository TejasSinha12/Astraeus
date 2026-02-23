"""
Interface for writing and querying cognitive performance data.
"""
from typing import Optional, List
import uuid
import time
from sqlalchemy.orm import Session

from metrics.db_schema import SessionLocal, ExecutionLog, MemoryTelemetry, HeuristicWeight, init_db
from utils.logger import logger

class MetricsTracker:
    """
    Singleton service bridging the execution loop with the persistent eval database.
    """

    def __init__(self):
        # Ensure tables exist
        init_db()
        self.current_version = "v1.0.0-baseline"
        logger.info("MetricsTracker connected to Telemetry DB.")

    def log_execution_step(
        self,
        session_id: str,
        task_type: str,
        step_num: int,
        confidence_score: float,
        success: bool,
        error_category: Optional[str] = None
    ) -> None:
        """
        Record the outcome and calibration of a single cognitive boundary.
        """
        with SessionLocal() as db:
            log = ExecutionLog(
                id=str(uuid.uuid4()),
                session_id=session_id,
                version_hash=self.current_version,
                task_type=task_type,
                step_num=step_num,
                confidence_score=confidence_score,
                success=success,
                error_category=error_category,
                timestamp=time.time()
            )
            db.add(log)
            db.commit()
            logger.debug(f"Telemetry logged execution step {step_num} for session {session_id}.")

    def record_memory_hit(self, memory_id: str, contributed_to_success: bool) -> None:
        """
        Updates the usage statistics for a specific piece of LongTermMemory.
        """
        with SessionLocal() as db:
            telemetry = db.query(MemoryTelemetry).filter(MemoryTelemetry.memory_id == memory_id).first()
            if not telemetry:
                telemetry = MemoryTelemetry(memory_id=memory_id, retrieval_count=0, usefulness_score=1.0)
                db.add(telemetry)
                
            telemetry.retrieval_count += 1
            
            # Simple moving average to calculate usefulness
            if contributed_to_success:
                telemetry.usefulness_score = (telemetry.usefulness_score * 0.9) + 0.1
            else:
                telemetry.usefulness_score = (telemetry.usefulness_score * 0.9) # Decay
                
            db.commit()

    def update_rule_weight(self, rule_hash: str, rule_text: str, weight_delta: float) -> None:
        """
        Adjusts the system prompt influence metric for an explicitly learned heuristic.
        """
        with SessionLocal() as db:
            hw = db.query(HeuristicWeight).filter(HeuristicWeight.rule_hash == rule_hash).first()
            if not hw:
                hw = HeuristicWeight(rule_hash=rule_hash, rule_text=rule_text, weight=0.5)
                db.add(hw)
                
            hw.weight += weight_delta
            # Clamp between 0 and 1
            hw.weight = max(0.0, min(1.0, hw.weight))
    def record_swarm_metric(self, version_id: str, metric_type: str, value: float) -> None:
        """
        Records architectural or swarm cooperation metrics for version-driven evolution.
        """
        from metrics.db_schema import SwarmMetric
        with SessionLocal() as db:
            metric = SwarmMetric(
                version_id=version_id,
                metric_type=metric_type,
                value=value,
                timestamp=time.time()
            )
            db.add(metric)
            db.commit()
            logger.info(f"Swarm Metric Logged: {metric_type}={value:.4f}")

tracker = MetricsTracker()
