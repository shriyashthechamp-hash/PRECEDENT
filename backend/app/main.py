from fastapi import FastAPI
from fastapi.responses import JSONResponse
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

# Parse explicit CORS allowlist
allowed_origins = [o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()]
if settings.ENVIRONMENT != "production":
    for dev_origin in ["http://localhost:3000", "http://127.0.0.1:3000"]:
        if dev_origin not in allowed_origins:
            allowed_origins.append(dev_origin)

# Enable Production CORS with explicit allowlist (no wildcard credentials)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["*"],
    allow_credentials=True if allowed_origins else False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global error handler in production to prevent stack trace leaks
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled error processing {request.method} {request.url.path}: {exc}", exc_info=(settings.ENVIRONMENT != "production"))
    if settings.ENVIRONMENT == "production":
        return JSONResponse(
            status_code=500,
            content={"detail": "An internal server error occurred. Please contact system support."}
        )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

# Readiness probe for Render zero-downtime deploys
@app.get("/ready")
@app.get(f"{settings.API_PREFIX}/ready")
def readiness_probe():
    return {"status": "ready", "product": settings.PROJECT_NAME, "version": settings.VERSION}

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

