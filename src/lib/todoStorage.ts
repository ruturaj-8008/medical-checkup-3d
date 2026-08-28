import type { Todo } from '../types/todo';

export const TODO_STORAGE_KEY = 'todo-app.todos.v1';

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string' &&
    !Number.isNaN(Date.parse(task.createdAt))
  );
}

function canUseStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
/**
 * Loads validated task records from versioned browser storage.
 *
 * @returns A safe task list, or an empty list when storage is inaccessible or invalid.
 */
export function loadTodos(): Todo[] {
  const storage = canUseStorage();
  if (!storage) {
    return [];
  }

  try {
    const savedValue = storage.getItem(TODO_STORAGE_KEY);
    if (!savedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);
    if (!Array.isArray(parsedValue) || !parsedValue.every(isTodo)) {
      return [];
    }

    return parsedValue;
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
/**
 * Persists a task list in browser storage.
 *
 * @param todos - The validated in-memory tasks to save.
 * @returns Whether the browser accepted the storage operation.
 */
export function saveTodos(todos: Todo[]): boolean {
  const storage = canUseStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    return true;
  } catch {
    return false;
  }
}
