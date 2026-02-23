"""
Database schema for public platform usage and token accounting.
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

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

# Database connection logic
DB_URL = "sqlite:///./api_platform.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_platform_db():
    Base.metadata.create_all(bind=engine)
    # Seed default plans
    # ...
