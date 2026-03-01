"""
Database schema for public platform usage and token accounting.
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

Base = declarative_base()

class SubscriptionPlan(Base):
    """
    Defines access tiers and monthly token quotas.
    """
    __tablename__ = "subscription_plans"
    
    id = Column(String, primary_key=True)
    name = Column(String)
    monthly_token_limit = Column(Integer)
    rate_limit_per_minute = Column(Integer)
    access_level = Column(Integer, default=1) # 1: Public, 2: Researcher, 3: Admin

class UserAccount(Base):
    """
    Stores user roles, token balances, and subscription info.
    """
    __tablename__ = "user_accounts"
    
    id = Column(String, primary_key=True) # Clerk User ID
    email = Column(String, unique=True)
    plan_id = Column(String, index=True)
    org_id = Column(String, index=True, nullable=True) # Multitenancy link
    role = Column(String, default="PUBLIC")
    token_balance = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TokenTransaction(Base):
    """
    Audit trail for every credit/debit operation.
    """
    __tablename__ = "token_transactions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    amount = Column(Integer) # Negative for debit
    transaction_type = Column(String) # 'DEBIT', 'CREDIT', 'REFUND'
    reference_id = Column(String) # API Request ID
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLog(Base):
    """
    Global security audit log for high-risk operations.
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    action = Column(String)
    metadata_json = Column(String) # JSON blob of request context
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class SwarmCluster(Base):
    """
    Registry for independent swarm instances within the federation.
    """
    __tablename__ = "swarm_clusters"
    
    id = Column(String, primary_key=True) # Cluster UUID (e.g., 'us-east-1', 'private-alpha')
    name = Column(String)
    region = Column(String)
    expertise_tags = Column(String) # JSON list: ["encryption", "react", "high-performance"]
    api_url = Column(String) # For inter-swarm communication
    governance_mode = Column(String, default="observe")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class FederatedMemory(Base):
    """
    Vector-backed structural pattern storage for cross-swarm knowledge transfer.
    """
    __tablename__ = "federated_memory"
    
    id = Column(String, primary_key=True)
    cluster_origin = Column(String, index=True) # ID of the cluster that discovered the pattern
    pattern_type = Column(String) # 'ARCH_DAG', 'CODE_REFACTOR', 'SECURITY_PATCH'
    embedding_json = Column(String) # JSON blob for vector similarity search
    structural_metadata = Column(String) # JSON metadata of the innovation
    confidence_score = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class UserBalance(Base):
    """
    Economic state for a user within the Ascension Marketplace.
    """
    __tablename__ = "user_balances"
    
    user_id = Column(String, primary_key=True)
    credit_balance = Column(Float, default=100.0) # Consumable execution units
    reputation_score = Column(Float, default=1.0) # Governance weight (earned, not bought)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class TokenLedger(Base):
    """
    Cryptographically signed audit trail for all economic transactions.
    """
    __tablename__ = "token_ledger"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, index=True)
    transaction_type = Column(String) # 'DEBIT', 'CREDIT', 'REFUND', 'REPUTATION_GAIN'
    amount = Column(Float)
    reason = Column(String)
    previous_hash = Column(String) # Reference to the previous record for integrity
    signature = Column(String) # HMAC-SHA256 signature of the record
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class APIKey(Base):
    """
    Scoped programmatic access keys for external developers.
    """
    __tablename__ = "api_keys"
    
    id = Column(String, primary_key=True) # Unique key ID
    user_id = Column(String, index=True)
    key_hash = Column(String, unique=True)
    label = Column(String) # Human-readable key name
    scopes = Column(String) # JSON list: ["execute", "research", "read_lineage"]
    monthly_quota = Column(Float, default=1000.0)
    current_usage = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class SwarmMission(Base):
    """
    Persistent repository for AI-generated codebases.
    Ensures data survival across redeploys.
    """
    __tablename__ = "swarm_missions"
    
    id = Column(String, primary_key=True) # Mission UUID
    user_id = Column(String, index=True)
    org_id = Column(String, index=True, nullable=True) # Multitenancy link
    cluster_id = Column(String, index=True, nullable=True) # ID of the swarm cluster that executed this
    parent_id = Column(String, index=True, nullable=True) # ID of the ancestor mission
    experiment_id = Column(String, index=True, nullable=True) # Associated A/B experiment
    objective = Column(String)
    source_code = Column(String) # For single-file results (legacy/simple)
    filename = Column(String)
    is_multifile = Column(Boolean, default=False)
    file_map = Column(String) # JSON blob for multi-file: {"path/to/file.py": "content", ...}
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ResearchArtifact(Base):
    """
    Formal scientific records generated from platform telemetry and evolution cycles.
    """
    __tablename__ = "research_artifacts"
    
    id = Column(String, primary_key=True)
    title = Column(String)
    abstract = Column(String)
    content_md = Column(String) # Peer-review grade research content
    status = Column(String, default="DRAFT") # DRAFT, VALIDATED, PUBLISHED
    significance_score = Column(Float) # Statistical delta / p-value
    integrity_hash = Column(String) # Cryptographic signature for audit
    citation_id = Column(String) # Auto-generated DOI style ID
    telemetry_bundle_path = Column(String) # Path to raw JSON logs/mutations
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Organization(Base):
    """
    Multi-tenant container for institutional users and research missions.
    """
    __tablename__ = "organizations"
    
    id = Column(String, primary_key=True)
    name = Column(String, unique=True)
    domain = Column(String) # Allowed email domains
    api_quota = Column(Float, default=10000.0)
    governance_policy = Column(String) # JSON configuration
    sso_config = Column(String) # Metadata for OAuth/OIDC
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ValidatorNode(Base):
    """
    Registry for external decentralized validator nodes participating in the research ecosystem.
    """
    __tablename__ = "validator_nodes"
    
    id = Column(String, primary_key=True)
    owner_id = Column(String, index=True)
    reputation_staked = Column(Float, default=0.0)
    uptime_score = Column(Float, default=1.0)
    total_validations = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    last_ping = Column(DateTime)

class BenchmarkChallenge(Base):
    """
    Structured challenges submitted by institutions for swarm competition.
    """
    __tablename__ = "benchmark_challenges"
    
    id = Column(String, primary_key=True)
    org_id = Column(String, index=True)
    title = Column(String)
    objective = Column(String)
    evaluation_criteria = Column(String) # JSON logic for scoring
    prize_tokens = Column(Float)
    deadline = Column(DateTime)
    is_live = Column(Boolean, default=False)

# Database connection logic
# Prioritize DATABASE_URL for Production (Railway PostgreSQL), fallback to SQLite for local
DB_URL = os.getenv("DATABASE_URL", "sqlite:///./api_platform.db")

# Handle Railway/Heroku style postgresql:// vs postgres://
if DB_URL.startswith("postgres://"):
    DB_URL = DB_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DB_URL, connect_args={"check_same_thread": False} if DB_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_platform_db():
    Base.metadata.create_all(bind=engine)
    # Seed default plans ...
