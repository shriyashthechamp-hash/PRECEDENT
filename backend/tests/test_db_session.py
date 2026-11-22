"""Tests for the SQLAlchemy session dependency helper."""
from sqlalchemy.orm import Session

from app.database import get_db


def test_get_db_yields_a_session():
    generator = get_db()
    session = next(generator)
    assert isinstance(session, Session)
    # Exhausting the generator runs the finally block that closes the session.
    try:
        next(generator)
    except StopIteration:
        pass
    else:
        raise AssertionError("get_db should stop after yielding once")


def test_utc_now_returns_fresh_values():
    from app.database import utc_now

    first = utc_now()
    second = utc_now()
    assert second >= first
