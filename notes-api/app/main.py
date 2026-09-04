"""FastAPI application entry point for the tag-aware notes service."""

from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app.database import initialize_database
from app.routers.notes import router as notes_router


class HealthResponse(BaseModel):
    """Public health-check response schema."""

    status: str = Field(..., description="Current service availability state.")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Initialize persistence before the service accepts requests."""
    initialize_database()
    yield


app = FastAPI(
    title="Notes API",
    description="A JSON API for CRUD note management with reusable tags.",
    version="0.1.0",
    openapi_tags=[
        {
            "name": "Notes",
            "description": "Create, retrieve, update, delete, filter, and tag notes.",
        }
    ],
    lifespan=lifespan,
)
app.include_router(notes_router)


# PUBLIC_INTERFACE
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Check service health",
    description="Confirm that the Notes API is running and accepting HTTP requests.",
)
def health_check() -> HealthResponse:
    """Return the availability status of this service.

    Returns:
        A response showing that the Notes API is available.
    """
    return HealthResponse(status="ok")
