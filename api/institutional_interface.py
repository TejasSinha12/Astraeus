"""
API Interface for Ascension Institutional Integration.
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from core.institutional_manager import InstitutionalManager
from core.grant_engine import GrantAutomationEngine
from core.validation_network import ValidationNetwork
from core.tournament_orchestrator import TournamentOrchestrator
from core.research_synthesis import ResearchSynthesisLayer
from api.usage_db import SessionLocal, Organization, ValidatorNode, BenchmarkChallenge
from utils.logger import logger

router = APIRouter(prefix="/institutional", tags=["Institutional"])

manager = InstitutionalManager()
grant_engine = GrantAutomationEngine()
validator_network = ValidationNetwork()
tournament = TournamentOrchestrator()
synthesis = ResearchSynthesisLayer()

class OrgCreate(BaseModel):
    name: str
    domain: str

class ValidatorRegister(BaseModel):
    owner_id: str
    node_id: str
    stake_amount: float

class ChallengeCreate(BaseModel):
    org_id: str
    title: str
    objective: str
    prize: float

@router.post("/orgs")
async def create_org(request: OrgCreate):
    """Provisions a new research organization."""
    org_id = manager.create_organization(request.name, request.domain)
    if not org_id:
        raise HTTPException(status_code=500, detail="Organization creation failed.")
    return {"org_id": org_id, "status": "Organization provisioned."}

@router.post("/validator/register")
async def register_validator(request: ValidatorRegister):
    """Registers an external node for decentralized validation."""
    success = validator_network.register_validator(request.owner_id, request.node_id, request.stake_amount)
    if not success:
        raise HTTPException(status_code=500, detail="Validator registration failed.")
    return {"status": "Validator registered.", "node_id": request.node_id}

@router.post("/challenges")
async def create_challenge(request: ChallengeCreate):
    """Submits a benchmark challenge for swarm competition."""
    challenge_id = tournament.create_challenge(request.org_id, request.title, request.objective, request.prize)
    if not challenge_id:
        raise HTTPException(status_code=500, detail="Challenge creation failed.")
    return {"challenge_id": challenge_id, "status": "Challenge is live."}

@router.get("/grants/{experiment_id}")
async def generate_grant_proposal(experiment_id: str, agency: str = "NSF"):
    """Generates a structured research proposal from experiment telemetry."""
    bundle = await synthesis.synthesize_mission_group(experiment_id)
    if not bundle:
        raise HTTPException(status_code=404, detail="No mission data found for this experiment.")
    
    proposal = grant_engine.generate_proposal(bundle, "Autonomous Swarm Intelligent Evolution")
    proposal = grant_engine.align_with_agency(proposal, agency)
    
    return {"proposal": proposal, "agency": agency, "experiment_id": experiment_id}

@router.get("/orgs/{org_id}/dashboard")
async def get_org_dashboard(org_id: str):
    """Returns organizational performance and governance summary."""
    with SessionLocal() as db:
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found.")
        
        # Get active challenges and missions
        challenges = db.query(BenchmarkChallenge).filter(BenchmarkChallenge.org_id == org_id).all()
        
        return {
            "org_name": org.name,
            "quota_usage": 0.45, # Simulated percentage
            "active_challenges": len(challenges),
            "governance": json.loads(org.governance_policy) if org.governance_policy else {}
        }
