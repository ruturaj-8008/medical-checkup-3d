# Notes API

A standalone FastAPI backend for creating, retrieving, updating, deleting, and organizing notes with reusable tags.

## Setup

From this directory, create an environment and install the service:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Run

```bash
uvicorn app.main:app --reload
```

The API is then available at `http://127.0.0.1:8000`.

- Interactive documentation: `/docs`
- OpenAPI specification: `/openapi.json`
- Health check: `/health`

By default, SQLite data is written to `data/notes.db`. To use another database, request that the `DATABASE_URL` environment variable be configured in the deployment environment.

## API overview

- `POST /notes` creates a note. Include a `tags` string array to assign tags.
- `GET /notes` lists notes, ordered by most recently updated. Supply `?tag=<name>` to filter by tag.
- `GET /notes/{note_id}`, `PUT /notes/{note_id}`, and `DELETE /notes/{note_id}` retrieve, replace, and delete a note.
- `GET /tags` lists reusable tags, including the number of notes assigned to each tag.

Tag names are trimmed, case-insensitively deduplicated, and returned in normalized lowercase form.

## Test

```bash
pytest
```
