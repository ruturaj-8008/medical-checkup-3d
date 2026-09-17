# To-Do Frontend

A responsive React and TypeScript client for the FastAPI to-do service. It supports creating, viewing, editing, completing or reopening, and deleting persisted tasks.

## Prerequisites

- Node.js 18 or later
- The FastAPI backend running locally (by default at `http://localhost:8000`)

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment example to your local environment file and adjust the API URL only if your FastAPI service uses another origin:

   ```bash
   cp .env.example .env.local
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

The application uses `VITE_API_BASE_URL` for its backend origin. When unset, it defaults to `http://localhost:8000`. This client does not use localStorage as a fallback: the FastAPI service remains the source of truth for every task.

## Production build

Create an optimized frontend bundle with:

```bash
npm run build
```

## Available commands

- `npm run dev` — run the development server.
- `npm run build` — type-check and create a production build.
- `npm run lint` — run the configured linter.
- `npm run preview` — serve a previously generated production build.
