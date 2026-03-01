"""
Ascension Intelligence Platform - Database Migration Utility.
Handles structural updates for swarm lineage, federated clusters, and the token economy.
"""
import os
from sqlalchemy import create_engine, inspect, text
from api.usage_db import engine, SwarmMission, SwarmCluster, FederatedMemory, UserBalance, TokenLedger, APIKey, ResearchArtifact
from utils.logger import logger

def migrate():
    """Manually adds columns/tables for evolutionary lineage and distributed federation."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # 0. Ensure Core Tables Exist
    if "swarm_missions" not in tables:
        SwarmMission.__table__.create(engine)
        logger.info("MIGRATION: Created 'swarm_missions' table.")
    
    # Refresh tables list
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    # 1. SwarmMission Lineage Columns (Phase 28)
    if "swarm_missions" in tables:
        columns = [c['name'] for c in inspector.get_columns('swarm_missions')]
        with engine.connect() as conn:
            if 'parent_id' not in columns:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN parent_id VARCHAR"))
                logger.info("MIGRATION: Added 'parent_id' to swarm_missions")
            if 'experiment_id' not in columns:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN experiment_id VARCHAR"))
                logger.info("MIGRATION: Added 'experiment_id' to swarm_missions")
            if 'cluster_id' not in columns:
                conn.execute(text("ALTER TABLE swarm_missions ADD COLUMN cluster_id VARCHAR"))
                logger.info("MIGRATION: Added 'cluster_id' to swarm_missions")
            conn.commit()

    # 2. Federation & Economy Tables (Phases 29-32)
    if "swarm_clusters" not in tables:
        SwarmCluster.__table__.create(engine)
        logger.info("MIGRATION: Created 'swarm_clusters' table.")

    if "federated_memory" not in tables:
        FederatedMemory.__table__.create(engine)
        logger.info("MIGRATION: Created 'federated_memory' table.")

    if "user_balances" not in tables:
        UserBalance.__table__.create(engine)
        logger.info("MIGRATION: Created 'user_balances' table.")

    if "token_ledger" not in tables:
        TokenLedger.__table__.create(engine)
        logger.info("MIGRATION: Created 'token_ledger' table.")

    if "api_keys" not in tables:
        APIKey.__table__.create(engine)
        logger.info("MIGRATION: Created 'api_keys' table.")

    if "research_artifacts" not in tables:
        ResearchArtifact.__table__.create(engine)
        logger.info("MIGRATION: Created 'research_artifacts' table.")

if __name__ == "__main__":
    migrate()
