"""
SQLAlchemy definitions for persistent tracking of AGI metrics over time.
"""
from typing import Optional
from sqlalchemy import Column, String, Float, Boolean, Integer, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from core_config import config

Base = declarative_base()

class ExecutionLog(Base):
    """
    Logs every discrete cognitive step taken by an agent for trend tracking.
    """
    __tablename__ = "execution_logs"

    id = Column(String, primary_key=True)
    session_id = Column(String, index=True)
    version_hash = Column(String, index=True)
    task_type = Column(String)  # 'Planning', 'Execution', 'Reflection'
    step_num = Column(Integer)
    
    # Calibration & Result
    confidence_score = Column(Float)
    success = Column(Boolean)
    error_category = Column(String, nullable=True) # E.g., 'ToolFail', 'Hallucination'
    
    # Meta
    timestamp = Column(Float)

class MemoryTelemetry(Base):
    """
    Tracks how often a VectorStore item is pulled into context, and if that 
    pull correlated with a successful Task Step. High hit-rate + low success = garbage memory.
    """
    __tablename__ = "memory_telemetry"

    memory_id = Column(String, primary_key=True)
    retrieval_count = Column(Integer, default=0)
    usefulness_score = Column(Float, default=1.0)
    
class HeuristicWeight(Base):
    """
    Tracks the performance score of a parsed learning rule so we can roll it back 
    if benchmarks regress.
    """
    __tablename__ = "heuristic_weights"
    
    rule_hash = Column(String, primary_key=True)
    rule_text = Column(String)
    weight = Column(Float, default=0.5)

class SwarmMetric(Base):
    """
    Tracks high-level performance indicators for the multi-agent swarm.
    """
    __tablename__ = "swarm_metrics"

    id = Column(Integer, primary_key=True)
    version_id = Column(String, index=True)
    metric_type = Column(String)  # 'EntropyReduction', 'AgreementRatio', 'EvolutionDelta'
    value = Column(Float)
    timestamp = Column(Float)

# Initialize Sync Engine (SQLite for simplicity, Postgres for production)
DB_PATH = f"sqlite:///{config.MEMORY_INDEX_PATH}_telemetry.db"
engine = create_engine(DB_PATH, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
