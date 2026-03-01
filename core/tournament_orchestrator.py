"""
Tournament Orchestrator for Ascension.
Manages live benchmark challenges and swarm competitions for institutional research.
"""
from typing import List, Dict, Any, Optional
import datetime
import uuid
from api.usage_db import SessionLocal, BenchmarkChallenge, SwarmMission
from utils.logger import logger

class TournamentOrchestrator:
    """
    Service for managing time-bound research competitions between swarms.
    """

    def create_challenge(self, org_id: str, title: str, objective: str, prize: float) -> str:
        """
        Submits a new benchmark challenge for swarm competition.
        """
        challenge_id = f"CHALL-{str(uuid.uuid4())[:8].upper()}"
        logger.info(f"TOURNAMENT: Creating challenge {title} for {org_id}...")
        
        try:
            with SessionLocal() as db:
                challenge = BenchmarkChallenge(
                    id=challenge_id,
                    org_id=org_id,
                    title=title,
                    objective=objective,
                    prize_tokens=prize,
                    deadline=datetime.datetime.utcnow() + datetime.timedelta(days=7),
                    is_live=True
                )
                db.add(challenge)
                db.commit()
                return challenge_id
        except Exception as e:
            logger.error(f"TOURNAMENT: Challenge creation failed: {e}")
            return ""

    def evaluate_submissions(self, challenge_id: str) -> List[Dict[str, Any]]:
        """
        Scores all mission submissions for a specific challenge based on fitness metrics.
        """
        logger.info(f"TOURNAMENT: Evaluating submissions for challenge {challenge_id}...")
        
        with SessionLocal() as db:
            # For simplicity, we find missions that contain the challenge ID in their objective
            submissions = db.query(SwarmMission).filter(SwarmMission.objective.contains(challenge_id)).all()
            
            results = []
            for m in submissions:
                results.append({
                    "mission_id": m.id,
                    "user_id": m.user_id,
                    "timestamp": m.timestamp.isoformat(),
                    "fitness_score": 0.95, # In production, this would use real benchmark scores
                    "rank": 1 # Mock ranking
                })
            
            # Sort by fitness
            results.sort(key=lambda x: x["fitness_score"], reverse=True)
            return results
