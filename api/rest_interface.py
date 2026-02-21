"""
FastAPI application exposing the AGI swarm to the outside world.
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional

from core_config import config
from agents.multi_agent_coordinator import MultiAgentCoordinator
from agents.autonomous_agent import AutonomousAgent
from utils.logger import logger

app = FastAPI(
    title=config.APP_NAME,
    description="API Gateway for the AGI Research Framework.",
    version="0.1.0"
)

# Global Swarm State
coordinator = MultiAgentCoordinator()

# Bootstrap a default agent on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Starting API REST Gateway...")
    default_agent = AutonomousAgent(agent_id="Alpha_Prime", role="General Commander")
    coordinator.register_agent(default_agent)

class TaskRequest(BaseModel):
    goal: str
    target_agent: Optional[str] = None

@app.post("/tasks/")
async def create_task(req: TaskRequest):
    """
    Submits a new high level goal to the swarm.
    """
    success = await coordinator.dispatch_task(
        task_description=req.goal,
        target_agent_id=req.target_agent
    )
    
    if not success:
        raise HTTPException(status_code=503, detail="Task rejected. No agents available or invalid target.")
        
    return {"status": "Task successfully dispatched to the swarm."}

@app.get("/swarm/status")
async def get_swarm_status():
    """
    Polls the status of all active agents.
    """
    status_report = await coordinator.get_swarm_status()
    return {
        "active_agents": len(status_report),
        "details": status_report
    }

@app.post("/swarm/emergency_stop")
async def emergency_stop():
    """
    Instantly halts all cognitive loops running on all agents.
    """
    await coordinator.emergency_stop_all()
    return {"status": "HALT SIGNAL PROPAGATED"}
