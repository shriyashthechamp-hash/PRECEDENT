from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.services.seed_service import seed_synthetic_environment
from app.routers import (
    health,
    proposals,
    rfp,
    review,
    memory,
    contradictions,
    claims,
    outcomes,
    comparison,
    analytics,
    clients,
    demo
)

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger("precedent.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    logger.info("Initializing PRECEDENT Institutional Intelligence Engine...")
    Base.metadata.create_all(bind=engine)
    
    # Auto-seed initial demo dataset
    db = SessionLocal()
    try:
        await seed_synthetic_environment(db, force=False)
    finally:
        db.close()
    
    yield
    logger.info("Shutting down PRECEDENT API...")

app = FastAPI(
    title="PRECEDENT API",
    description="AI-Native Institutional Intelligence Platform for Proposals & RFPs",
    version=settings.VERSION,
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers under /api
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(proposals.router, prefix=settings.API_PREFIX)
app.include_router(rfp.router, prefix=settings.API_PREFIX)
app.include_router(review.router, prefix=settings.API_PREFIX)
app.include_router(memory.router, prefix=settings.API_PREFIX)
app.include_router(contradictions.router, prefix=settings.API_PREFIX)
app.include_router(claims.router, prefix=settings.API_PREFIX)
app.include_router(outcomes.router, prefix=settings.API_PREFIX)
app.include_router(comparison.router, prefix=settings.API_PREFIX)
app.include_router(analytics.router, prefix=settings.API_PREFIX)
app.include_router(clients.router, prefix=settings.API_PREFIX)
app.include_router(demo.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "product": "PRECEDENT",
        "positioning": "Your organization's memory. Your next unfair advantage.",
        "tagline": "Every bid builds a better next bid.",
        "api_docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

