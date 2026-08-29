# Today's Tasks

A focused, local-first todo application built with React and TypeScript. Tasks are stored in the browser, so the app works without an account, server, or network connection.

## Features

- Add non-empty tasks from the keyboard or with the add button.
- Mark tasks complete, edit their text, or delete them.
- Filter tasks by all, active, or completed status.
- Clear completed tasks and view active/completed counts.
- Persist tasks in `localStorage` under the `todo-app.todos` key.
- Safely recover to an empty list if saved browser data is invalid.
- Use responsive layouts and visible keyboard focus styles on small and large screens.

## Run locally

### Prerequisites

Install a current Node.js release (Node 20.19+ is recommended for the included Vite toolchain).

### Install and start

```bash
cd medical-checkup-3d
npm install
npm run dev
```

Vite displays the local development URL, usually `http://localhost:5173`.

## Quality commands

```bash
npm run lint
npm run build
```

`npm run build` checks TypeScript and produces an optimized static bundle in `dist/`.

## Technology

- React 19
- TypeScript
- Vite
- Lucide React
- Vanilla CSS
- Browser localStorage for persistence
