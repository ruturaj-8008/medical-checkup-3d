export interface Task {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface CreateTaskPayload {
  title: string;
}

export interface UpdateTaskPayload {
  title: string;
}

export class TaskApiError extends Error {
  /** Creates a user-safe error for an unsuccessful task API request. */
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'TaskApiError';
  }
}
