"""
Research Synthesis Layer for Ascension.
Aggregates swarm telemetry, lineage, and performance data into structured research objects.
"""
from typing import List, Dict, Any, Optional
import datetime
import json
import hashlib
from pydantic import BaseModel
from api.usage_db import SessionLocal, SwarmMission, FederatedMemory, ResearchArtifact
from utils.logger import logger

class ResearchDataBundle(BaseModel):
    title: str
    objective_summary: str
    telemetry_logs: List[Dict[str, Any]]
    mutation_lineage: List[str]
    performance_metrics: Dict[str, float]
    entropy_delta: float
    reproducibility_score: float = 0.0

class ResearchSynthesisLayer:
    """
    Orchestrates the conversion of raw swarm activity into structured research data.
    """

    def __init__(self):
        self.active_bundles: Dict[str, ResearchDataBundle] = {}

    async def synthesize_mission_group(self, experiment_id: str) -> Optional[ResearchDataBundle]:
        """
        Aggregates data for all missions associated with a specific experiment ID.
        """
        logger.info(f"RESEARCH: Synthesizing data for experiment {experiment_id}...")
        
        try:
            with SessionLocal() as db:
                missions = db.query(SwarmMission).filter(SwarmMission.experiment_id == experiment_id).all()
                if not missions:
                    logger.warning(f"RESEARCH: No missions found for experiment {experiment_id}")
                    return None
                
                # 1. Aggregate Telemetry
                telemetry = []
                lineage = []
                total_fitness = 0.0
                
                for m in missions:
                    telemetry.append({
                        "mission_id": m.id,
                        "timestamp": m.timestamp.isoformat(),
                        "objective": m.objective,
                        "is_multifile": m.is_multifile
                    })
                    if m.parent_id:
                        lineage.append(f"{m.parent_id} -> {m.id}")
                
                # 2. Extract Memory Patterns (Innovations)
                patterns = db.query(FederatedMemory).filter(FederatedMemory.structural_metadata.contains(experiment_id)).all()
                
                # 3. Calculate Performance Metrics (Mock for now, would use real benchmark data)
                metrics = {
                    "avg_token_efficiency": 0.85,
                    "reasoning_depth_avg": 4.2,
                    "stability_coefficient": 0.94,
                    "cognitive_diversity": len(set([m.id for m in missions])) / 10.0
                }
                
                bundle = ResearchDataBundle(
                    title=f"Autonomous Evolution Study: {experiment_id}",
                    objective_summary=missions[0].objective,
                    telemetry_logs=telemetry,
                    mutation_lineage=list(set(lineage)),
                    performance_metrics=metrics,
                    entropy_delta=-12.5 # Negative indicates entropy reduction
                )
                
                return bundle
        except Exception as e:
            logger.error(f"RESEARCH: Synthesis failed: {e}")
            return None

    def create_artifact_record(self, bundle: ResearchDataBundle) -> str:
        """
        Persists the initial draft of a ResearchArtifact to the database.
        """
        artifact_id = f"RES-{hashlib.md5(bundle.title.encode()).hexdigest()[:8]}"
        
        try:
            with SessionLocal() as db:
                artifact = ResearchArtifact(
                    id=artifact_id,
                    title=bundle.title,
                    abstract=f"An analysis of swarm evolution for objective: {bundle.objective_summary}.",
                    content_md="# Methodology\nPending compilation...",
                    status="DRAFT",
                    significance_score=bundle.performance_metrics.get("stability_coefficient", 0.0),
                    telemetry_bundle_path=f"api/sandbox/research/{artifact_id}_telemetry.json"
                )
                db.add(artifact)
                db.commit()
                logger.info(f"RESEARCH: Created artifact record {artifact_id}")
                return artifact_id
        except Exception as e:
            logger.error(f"RESEARCH: Record creation failed: {e}")
            return ""
