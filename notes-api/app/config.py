"""Application configuration values."""

from __future__ import annotations

import os
from pathlib import Path

DEFAULT_DATABASE_PATH = Path(__file__).resolve().parent.parent / "data" / "notes.db"


# PUBLIC_INTERFACE
def get_database_url() -> str:
    """Return the configured SQLAlchemy database URL.

    Returns:
        The value of ``DATABASE_URL`` when configured, otherwise the local
        SQLite development database URL.
    """
    configured_url = os.getenv("DATABASE_URL")
    if configured_url:
        return configured_url

    DEFAULT_DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{DEFAULT_DATABASE_PATH}"
