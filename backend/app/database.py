"""SQLAlchemy engine, session factory, and declarative base.

The connection string comes from ``settings.DATABASE_URL`` and supports both
SQLite and PostgreSQL. SQLite is configured with ``check_same_thread=False``;
other engines use connection pooling with ``pool_pre_ping``.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime, timezone
from typing import Generator
from app.config import settings

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

# Render provides postgres:// which SQLAlchemy 2.0+ requires as postgresql://
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

is_sqlite = db_url.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}
pool_kwargs = {"pool_pre_ping": True}
if not is_sqlite:
    pool_kwargs["pool_size"] = 10
    pool_kwargs["max_overflow"] = 20

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **pool_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

