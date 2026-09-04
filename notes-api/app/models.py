"""SQLAlchemy persistence models for notes and reusable tags."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

note_tags = Table(
    "note_tags",
    Base.metadata,
    Column("note_id", ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


# PUBLIC_INTERFACE
def utc_now() -> datetime:
    """Return the current timezone-aware UTC timestamp.

    Returns:
        The current timestamp in UTC.
    """
    return datetime.now(timezone.utc)


class Note(Base):
    """Persisted note with content, timestamps, and a collection of tags."""

    __tablename__ = "notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )
    tags: Mapped[list["Tag"]] = relationship(
        secondary=note_tags,
        back_populates="notes",
        lazy="selectin",
    )


class Tag(Base):
    """Persisted normalized tag reusable across multiple notes."""

    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    notes: Mapped[list[Note]] = relationship(
        secondary=note_tags,
        back_populates="tags",
        lazy="selectin",
    )
