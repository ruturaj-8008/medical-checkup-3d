export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';

export type TaskAction =
  | { type: 'add'; title: string }
  | { type: 'toggle'; id: string }
  | { type: 'edit'; id: string; title: string }
  | { type: 'delete'; id: string }
  | { type: 'clearCompleted' }
  | { type: 'setFilter'; filter: TaskFilter };
