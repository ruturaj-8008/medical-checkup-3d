"""HTTP routes for note CRUD operations and tag discovery."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Note, Tag
from app.schemas import NoteCreate, NoteRead, NoteUpdate, TagSummary

router = APIRouter(tags=["Notes"])


def get_note_or_404(note_id: int, database_session: Session) -> Note:
    """Load a note and its tags or raise a consistent missing-resource error."""
    statement = (
        select(Note)
        .where(Note.id == note_id)
        .options(selectinload(Note.tags))
    )
    note = database_session.scalar(statement)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found.")
    return note


def resolve_tags(tag_names: list[str], database_session: Session) -> list[Tag]:
    """Find existing normalized tags and create only the names not yet persisted."""
    if not tag_names:
        return []

    existing_tags = database_session.scalars(
        select(Tag).where(Tag.name.in_(tag_names))
    ).all()
    tags_by_name = {tag.name: tag for tag in existing_tags}

    for tag_name in tag_names:
        if tag_name not in tags_by_name:
            tags_by_name[tag_name] = Tag(name=tag_name)

    return [tags_by_name[tag_name] for tag_name in tag_names]


def save_or_rollback(database_session: Session) -> None:
    """Commit a database transaction and preserve a valid session after failures."""
    try:
        database_session.commit()
    except SQLAlchemyError as error:
        database_session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save note changes.",
        ) from error


# PUBLIC_INTERFACE
@router.post(
    "/notes",
    response_model=NoteRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a note",
    description="Create a note and assign zero or more normalized reusable tags.",
    responses={201: {"description": "Created note."}},
)
def create_note(
    payload: NoteCreate,
    database_session: Session = Depends(get_db),
) -> Note:
    """Create a note from validated title, content, and tag values.

    Args:
        payload: The validated note fields and tag names.
        database_session: Request-scoped SQLAlchemy persistence session.

    Returns:
        The newly persisted note, including its resolved tags.
    """
    note = Note(title=payload.title, content=payload.content)
    note.tags = resolve_tags(payload.tags, database_session)
    database_session.add(note)
    save_or_rollback(database_session)
    database_session.refresh(note, attribute_names=["tags"])
    return note


# PUBLIC_INTERFACE
@router.get(
    "/notes",
    response_model=list[NoteRead],
    summary="List notes",
    description="List notes ordered by newest update first, optionally filtered by tag.",
)
def list_notes(
    tag: str | None = Query(
        default=None,
        max_length=80,
        description="Normalized tag name used to filter returned notes.",
    ),
    database_session: Session = Depends(get_db),
) -> list[Note]:
    """Return current notes, optionally restricted to a tag.

    Args:
        tag: Optional tag name filter.
        database_session: Request-scoped SQLAlchemy persistence session.

    Returns:
        Notes sorted by most recently updated, with assigned tags.
    """
    statement = select(Note).options(selectinload(Note.tags)).order_by(Note.updated_at.desc())

    if tag is not None:
        normalized_tag = tag.strip().lower()
        if not normalized_tag:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Tag filter must not be blank.",
            )
        statement = statement.join(Note.tags).where(Tag.name == normalized_tag)

    return list(database_session.scalars(statement).unique().all())


# PUBLIC_INTERFACE
@router.get(
    "/notes/{note_id}",
    response_model=NoteRead,
    summary="Get a note",
    description="Retrieve one note and its assigned tags by identifier.",
    responses={404: {"description": "No note exists for the requested identifier."}},
)
def get_note(
    note_id: int,
    database_session: Session = Depends(get_db),
) -> Note:
    """Return a single note or a 404 response.

    Args:
        note_id: Server-assigned note identifier.
        database_session: Request-scoped SQLAlchemy persistence session.

    Returns:
        The requested note including its tags.
    """
    return get_note_or_404(note_id, database_session)


# PUBLIC_INTERFACE
@router.put(
    "/notes/{note_id}",
    response_model=NoteRead,
    summary="Replace a note",
    description="Replace the editable fields and complete tag assignment for a note.",
    responses={404: {"description": "No note exists for the requested identifier."}},
)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    database_session: Session = Depends(get_db),
) -> Note:
    """Replace a note's title, content, and tag assignments.

    Args:
        note_id: Server-assigned note identifier.
        payload: Validated replacement note fields and tag names.
        database_session: Request-scoped SQLAlchemy persistence session.

    Returns:
        The updated note including its replacement tags.
    """
    note = get_note_or_404(note_id, database_session)
    note.title = payload.title
    note.content = payload.content
    note.tags = resolve_tags(payload.tags, database_session)
    save_or_rollback(database_session)
    database_session.refresh(note, attribute_names=["tags"])
    return note


# PUBLIC_INTERFACE
@router.delete(
    "/notes/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a note",
    description="Delete a note by identifier. Tags with no assigned notes remain reusable.",
    responses={404: {"description": "No note exists for the requested identifier."}},
)
def delete_note(
    note_id: int,
    database_session: Session = Depends(get_db),
) -> Response:
    """Delete an existing note and return an empty success response.

    Args:
        note_id: Server-assigned note identifier.
        database_session: Request-scoped SQLAlchemy persistence session.

    Returns:
        A response with HTTP 204 and no body.
    """
    note = get_note_or_404(note_id, database_session)
    database_session.delete(note)
    save_or_rollback(database_session)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# PUBLIC_INTERFACE
@router.get(
    "/tags",
    response_model=list[TagSummary],
    summary="List tags",
    description="List reusable tags alphabetically with their current note assignment counts.",
)
def list_tags(database_session: Session = Depends(get_db)) -> list[TagSummary]:
    """Return all tags and the number of notes assigned to each.

    Args:
        database_session: Request-scoped SQLAlchemy persistence session.

    Returns:
        Alphabetically ordered tag summaries.
    """
    statement = (
        select(Tag.id, Tag.name, func.count(Note.id).label("note_count"))
        .outerjoin(Tag.notes)
        .group_by(Tag.id, Tag.name)
        .order_by(Tag.name.asc())
    )
    return [
        TagSummary(id=tag_id, name=name, note_count=note_count)
        for tag_id, name, note_count in database_session.execute(statement)
    ]
