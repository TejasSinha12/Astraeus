"""
Database schema for public platform usage and token accounting.
"""
from sqlalchemy import Column, String, Float, Integer, DateTime, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

Base = declarative_base()

class UserAccount(Base):
    """
    Stores user roles, token balances, and subscription info.
    """
    __tablename__ = "user_accounts"
    
    id = Column(String, primary_key=True) # Clerk User ID
    email = Column(String, unique=True)
    role = Column(String, default="PUBLIC") # PUBLIC, RESEARCH, ADMIN
    token_balance = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class APIUsageLog(Base):
    """
    Logs every request routed through the Platform API gateway.
    """
    __tablename__ = "api_usage_logs"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True)
    endpoint = Column(String)
    tokens_deducted = Column(Integer)
    status_code = Column(Integer)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# Database connection logic
DB_URL = "sqlite:///./api_platform.db"
engine = create_engine(DB_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_platform_db():
    Base.metadata.create_all(bind=engine)
