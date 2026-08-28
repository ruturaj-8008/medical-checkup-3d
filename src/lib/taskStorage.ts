import type { Task } from '../types/task';

const STORAGE_KEY = 'local-first-todo.tasks.v1';

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.title === 'string' &&
    candidate.title.trim().length > 0 &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'string' &&
    !Number.isNaN(Date.parse(candidate.createdAt))
  );
}

/**
 * Loads validated task records from browser local storage.
 * Corrupted, unavailable, or incompatible values safely resolve to an empty list.
 */
export function loadTasks(): Task[] {
  try {
    const serializedTasks = window.localStorage.getItem(STORAGE_KEY);

    if (!serializedTasks) {
      return [];
    }

    const parsedTasks: unknown = JSON.parse(serializedTasks);

    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isTask)) {
      return [];
    }

    return parsedTasks.map((task) => ({
      id: task.id,
      title: task.title.trim(),
      completed: task.completed,
      createdAt: task.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * Persists the current task collection without allowing storage failures to interrupt use.
 */
export function saveTasks(tasks: Task[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage can be blocked by browser privacy settings or exhausted quotas.
  }
}
