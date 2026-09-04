"""Pydantic schemas that define the public notes API contract."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


# PUBLIC_INTERFACE
def normalize_tag_names(values: list[str]) -> list[str]:
    """Trim, lowercase, validate, and deduplicate tag names.

    Args:
        values: Candidate tag names supplied by an API client.

    Returns:
        Unique normalized tag names in client-provided order.

    Raises:
        ValueError: If a tag is blank or longer than 80 characters.
    """
    normalized_names: list[str] = []
    seen_names: set[str] = set()

    for value in values:
        normalized_name = value.strip().lower()
        if not normalized_name:
            raise ValueError("Tag names must not be blank.")
        if len(normalized_name) > 80:
            raise ValueError("Tag names must be 80 characters or fewer.")
        if normalized_name not in seen_names:
            normalized_names.append(normalized_name)
            seen_names.add(normalized_name)

    return normalized_names


class NoteInput(BaseModel):
    """Shared validated editable fields for a note."""

    title: str = Field(..., max_length=255, description="A non-blank note title.")
    content: str | None = Field(
        default=None,
        description="Optional text content for the note.",
    )
    tags: list[str] = Field(
        default_factory=list,
        max_length=20,
        description="Unique tag names to assign to this note.",
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        """Ensure note titles contain non-whitespace text."""
        trimmed_value = value.strip()
        if not trimmed_value:
            raise ValueError("Title must not be blank.")
        return trimmed_value

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, values: list[str]) -> list[str]:
        """Normalize client-supplied tag names."""
        return normalize_tag_names(values)


class NoteCreate(NoteInput):
    """Request body used to create a note."""


class NoteUpdate(NoteInput):
    """Request body used to replace a note's editable fields."""


class TagRead(BaseModel):
    """Public representation of a reusable tag."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Server-assigned tag identifier.")
    name: str = Field(..., description="Normalized tag name.")


class TagSummary(TagRead):
    """Tag representation that includes note assignment metadata."""

    note_count: int = Field(..., description="Number of notes assigned to this tag.")


class NoteRead(BaseModel):
    """Public representation of a note and its assigned tags."""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(..., description="Server-assigned note identifier.")
    title: str = Field(..., description="Validated non-blank note title.")
    content: str | None = Field(..., description="Optional note content.")
    created_at: datetime = Field(..., description="UTC time at which the note was created.")
    updated_at: datetime = Field(..., description="UTC time at which the note was last updated.")
    tags: list[TagRead] = Field(..., description="Tags currently assigned to the note.")
