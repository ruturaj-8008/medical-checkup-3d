import type { Todo } from '../types/todo';

export const TODO_STORAGE_KEY = 'todo-app.todos.v1';

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.text === 'string' &&
    candidate.text.trim().length > 0 &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number' &&
    Number.isFinite(candidate.createdAt)
  );
}

/**
 * Restores validated todos from browser storage.
 *
 * Malformed, unavailable, or legacy storage data is treated as an empty list so
 * a storage failure cannot stop the application from rendering.
 */
export function loadTodos(): Todo[] {
  try {
    const storedValue = window.localStorage.getItem(TODO_STORAGE_KEY);

    if (storedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue) || !parsedValue.every(isTodo)) {
      window.localStorage.removeItem(TODO_STORAGE_KEY);
      return [];
    }

    return parsedValue;
  } catch {
    return [];
  }
}

/**
 * Saves the current canonical todo list to browser storage.
 *
 * Storage errors, including privacy-mode or quota errors, are deliberately
 * ignored because the in-memory todo workflow remains fully usable.
 */
export function saveTodos(todos: Todo[]): void {
  try {
    window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Persistence is progressive enhancement; keep the UI responsive on failure.
  }
}
