from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.config import settings
from app.services.hindsight import hindsight_service

router = APIRouter(prefix="/health", tags=["Health & Status"])

@router.get("")
async def check_system_health(db: Session = Depends(get_db)):
    # 1. DB check
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    # 2. Hindsight check
    hindsight_info = await hindsight_service.check_health()

    # 3. Groq check
    groq_status = "configured_live" if settings.GROQ_API_KEY else "unconfigured_using_deterministic_engine"

    return {
        "status": "operational",
        "product": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "status": db_status,
            "engine": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql"
        },
        "hindsight_memory": hindsight_info,
        "groq_inference": {
            "status": groq_status,
            "primary_model": settings.GROQ_MODEL,
            "fallback_model": settings.GROQ_FALLBACK_MODEL
        },
        "environment": settings.ENVIRONMENT,
        "synthetic_demo_mode": True
    }

