from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.client import Client, Sector, CompanyProfile
from app.services.seed_service import seed_synthetic_environment

router = APIRouter(prefix="", tags=["Clients, Sectors & Company"])

@router.get("/clients")
def list_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()

@router.get("/sectors")
def list_sectors(db: Session = Depends(get_db)):
    return db.query(Sector).all()

@router.get("/company-profile")
def get_company_profile(db: Session = Depends(get_db)):
    profile = db.query(CompanyProfile).first()
    return profile

@router.post("/seed")
async def seed_data(force: bool = False, db: Session = Depends(get_db)):
    return await seed_synthetic_environment(db, force=force)
