import type { Task } from '../types/todo';

export const TASK_STORAGE_KEY = 'today-tasks-v1';

/**
 * Verifies that a parsed storage value is a valid task record.
 */
function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string'
  );
}

// PUBLIC_INTERFACE
export function loadTasks(): Task[] {
  /** Loads valid persisted tasks, returning an empty list if browser storage is unavailable or malformed. */
  try {
    const storedValue = window.localStorage.getItem(TASK_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.filter(isTask) : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function saveTasks(tasks: Task[]): void {
  /** Persists the current task list while silently tolerating unavailable browser storage. */
  try {
    window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage can be disabled or full; task interactions remain usable in memory.
  }
}
