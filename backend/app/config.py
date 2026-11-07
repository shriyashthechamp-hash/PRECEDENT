import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "PRECEDENT"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./precedent.db")
    
    # AI Inference (Groq)
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    GROQ_FALLBACK_MODEL: str = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")
    
    # Hindsight Memory Engine
    HINDSIGHT_API_URL: str = os.getenv("HINDSIGHT_API_URL", "http://localhost:8888")
    HINDSIGHT_API_KEY: Optional[str] = os.getenv("HINDSIGHT_API_KEY", None)
    HINDSIGHT_BANK_ID: str = os.getenv("HINDSIGHT_BANK_ID", "precedent-institutional-memory")
    
    # Security & Org
    DEFAULT_ORGANIZATION_ID: str = os.getenv("DEFAULT_ORGANIZATION_ID", "org_precedent_demo")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "precedent-secret-key-change-in-production")
    
    # File Storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
