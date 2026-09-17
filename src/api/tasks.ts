import type { CreateTaskPayload, Task, UpdateTaskPayload } from '../todo/types';
import { TaskApiError } from '../todo/types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(
  /\/$/,
  '',
);

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'number' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.created_at === 'string' &&
    (typeof task.completed_at === 'string' || task.completed_at === null)
  );
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new TaskApiError(
      'Unable to reach the task service. Check that the FastAPI backend is running.',
    );
  }

  if (!response.ok) {
    let message = `The request failed (${response.status}).`;

    try {
      const payload: unknown = await response.json();
      if (
        typeof payload === 'object' &&
        payload !== null &&
        typeof (payload as Record<string, unknown>).detail === 'string'
      ) {
        message = (payload as Record<string, string>).detail;
      }
    } catch {
      // A non-JSON error response still receives a useful fallback message.
    }

    throw new TaskApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new TaskApiError('The task service returned an invalid response.');
  }
}

// PUBLIC_INTERFACE
/** Retrieves every persisted task from the FastAPI service. */
export async function getTasks(): Promise<Task[]> {
  const tasks = await request<unknown>('/api/tasks');

  if (!Array.isArray(tasks) || !tasks.every(isTask)) {
    throw new TaskApiError('The task service returned malformed task data.');
  }

  return tasks;
}

// PUBLIC_INTERFACE
/** Creates a new task with the supplied, non-empty title. */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const task = await request<unknown>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!isTask(task)) {
    throw new TaskApiError('The task service returned malformed task data.');
  }

  return task;
}

// PUBLIC_INTERFACE
/** Updates the title of an existing task. */
export async function updateTask(taskId: number, payload: UpdateTaskPayload): Promise<Task> {
  const task = await request<unknown>(`/api/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!isTask(task)) {
    throw new TaskApiError('The task service returned malformed task data.');
  }

  return task;
}

// PUBLIC_INTERFACE
/** Toggles the completion state of an existing task. */
export async function toggleTask(taskId: number): Promise<Task> {
  const task = await request<unknown>(`/api/tasks/${taskId}/toggle`, {
    method: 'PATCH',
  });

  if (!isTask(task)) {
    throw new TaskApiError('The task service returned malformed task data.');
  }

  return task;
}

// PUBLIC_INTERFACE
/** Permanently deletes an existing task. */
export async function deleteTask(taskId: number): Promise<void> {
  await request<void>(`/api/tasks/${taskId}`, { method: 'DELETE' });
}
