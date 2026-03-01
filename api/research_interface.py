"""
API Interface for Ascension Research & Publication.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.research_synthesis import ResearchSynthesisLayer, ResearchDataBundle
from core.research_compiler import ResearchCompiler
from core.validation_engine import ValidationEngine
from core.hypothesis_generator import HypothesisGenerator
from api.usage_db import SessionLocal, ResearchArtifact
from utils.logger import logger

router = APIRouter(prefix="/research", tags=["Research"])

synthesis = ResearchSynthesisLayer()
compiler = ResearchCompiler()
validator = ValidationEngine()
hypothesizer = HypothesisGenerator()

class ResearchTrigger(BaseModel):
    experiment_id: str
    publish_immediately: bool = False

@router.post("/synthesize")
async def trigger_synthesis(request: ResearchTrigger):
    """
    Triggers the autonomous research pipeline for a specific experiment.
    """
    # 1. Aggregate Data
    bundle = await synthesis.synthesize_mission_group(request.experiment_id)
    if not bundle:
        raise HTTPException(status_code=404, detail="No mission data found for this experiment.")
    
    # 2. Validate Reproducibility
    score = await validator.validate_reproducibility(bundle)
    bundle.reproducibility_score = score
    
    # 3. Check Significance
    is_significant = validator.check_statistical_significance(bundle)
    
    # 4. Generate Hypotheses
    hypotheses = hypothesizer.generate_hypotheses(bundle)
    
    # 5. Compile Artifact
    content_md = compiler.compile_to_markdown(bundle)
    content_md += "\n\n## Generated Research Hypotheses\n"
    for h in hypotheses:
        content_md += f"- {h}\n"
    
    # 6. Save to DB
    artifact_id = synthesis.create_artifact_record(bundle)
    
    with SessionLocal() as db:
        artifact = db.query(ResearchArtifact).filter(ResearchArtifact.id == artifact_id).first()
        if artifact:
            artifact.content_md = content_md
            artifact.status = "VALIDATED" if is_significant else "DRAFT"
            if request.publish_immediately and is_significant:
                artifact.status = "PUBLISHED"
                artifact.citation_id = f"ASC-{artifact_id}"
            db.commit()

    return {
        "artifact_id": artifact_id,
        "reproducibility_score": score,
        "is_significant": is_significant,
        "status": "VALIDATED" if is_significant else "DRAFT",
        "hypotheses_count": len(hypotheses)
    }

@router.get("/artifacts")
async def list_artifacts() -> List[Dict[str, Any]]:
    """
    Returns a registry of all research artifacts.
    """
    with SessionLocal() as db:
        artifacts = db.query(ResearchArtifact).all()
        return [
            {
                "id": a.id,
                "title": a.title,
                "status": a.status,
                "score": a.significance_score,
                "citation": a.citation_id,
                "created_at": a.created_at.isoformat()
            } for a in artifacts
        ]

@router.get("/artifacts/{artifact_id}")
async def get_artifact(artifact_id: str):
    """
    Returns the full content of a research artifact.
    """
    with SessionLocal() as db:
        artifact = db.query(ResearchArtifact).filter(ResearchArtifact.id == artifact_id).first()
        if not artifact:
            raise HTTPException(status_code=404, detail="Artifact not found.")
        
        return {
            "title": artifact.title,
            "abstract": artifact.abstract,
            "content": artifact.content_md,
            "status": artifact.status,
            "citation": artifact.citation_id
        }
