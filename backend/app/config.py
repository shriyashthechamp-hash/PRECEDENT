import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Explicitly search and load .env from current dir or parent dir
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
root_dir = backend_dir.parent

env_paths = [
    root_dir / ".env",
    backend_dir / ".env",
    Path(".env")
]

for p in env_paths:
    if p.exists():
        load_dotenv(dotenv_path=p, override=False)

class Settings(BaseSettings):
    PROJECT_NAME: str = "PRECEDENT"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite:///./precedent.db"
    
    # CORS Allowlist (Comma-separated)
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # AI Inference (Groq)
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-120b"
    GROQ_FALLBACK_MODEL: str = "openai/gpt-oss-20b"
    
    # Hindsight Memory Engine
    HINDSIGHT_API_URL: str = "http://localhost:8888"
    HINDSIGHT_API_KEY: Optional[str] = None
    HINDSIGHT_BANK_ID: str = "precedent-institutional-memory"
    
    # Security & Org
    DEFAULT_ORGANIZATION_ID: str = "org_precedent_demo"
    SECRET_KEY: str = "precedent-secret-key-change-in-production"
    
    # File Storage
    UPLOAD_DIR: str = "uploads"
    
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
