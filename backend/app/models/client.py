from sqlalchemy import Column, String, DateTime, JSON, Text
from datetime import datetime
import uuid
from app.database import Base

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(String(64), primary_key=True, default=lambda: f"cli_{uuid.uuid4().hex[:12]}")
    name = Column(String(255), nullable=False, index=True)
    industry = Column(String(128), nullable=False, index=True)
    description = Column(Text, nullable=True)
    preferences = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

class Sector(Base):
    __tablename__ = "sectors"
    
    id = Column(String(64), primary_key=True, default=lambda: f"sec_{uuid.uuid4().hex[:12]}")
    name = Column(String(128), nullable=False, unique=True, index=True)
    compliance_standards = Column(JSON, default=list) # e.g. ["HIPAA", "SOC2 Type II", "HITRUST"]
    common_requirements = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

class CompanyProfile(Base):
    __tablename__ = "company_profile"
    
    id = Column(String(64), primary_key=True, default="default_profile")
    company_name = Column(String(255), default="Vanguard Logic Systems")
    tagline = Column(String(255), default="Enterprise Workflow Automation & Document Intelligence")
    description = Column(Text, nullable=True)
    facts = Column(JSON, default=dict) # approved corporate facts
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

