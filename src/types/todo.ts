export type TodoFilter = 'all' | 'active' | 'completed';

/** Represents one browser-local task in the todo application. */
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

/** Describes each state transition supported by the todo reducer. */
export type TodoAction =
  | { type: 'hydrate'; todos: Todo[] }
  | { type: 'add'; todo: Todo }
  | { type: 'toggle'; id: string }
  | { type: 'update'; id: string; text: string }
  | { type: 'remove'; id: string }
  | { type: 'clearCompleted' };
