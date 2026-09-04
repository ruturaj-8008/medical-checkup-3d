"""Database engine, session dependency, and schema initialization utilities."""

from __future__ import annotations

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_database_url

DATABASE_URL = get_database_url()
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy persistence models."""


# PUBLIC_INTERFACE
def get_db() -> Generator[Session, None, None]:
    """Yield a request-scoped database session and safely close it.

    Yields:
        An active SQLAlchemy session for the current request.
    """
    database_session = SessionLocal()
    try:
        yield database_session
    except Exception:
        database_session.rollback()
        raise
    finally:
        database_session.close()


# PUBLIC_INTERFACE
def initialize_database() -> None:
    """Create all application tables when they do not already exist."""
    from app import models  # noqa: F401 - registers mapped models before creation.

    Base.metadata.create_all(bind=engine)
