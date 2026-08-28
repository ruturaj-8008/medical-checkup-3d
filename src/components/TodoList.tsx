import type { Todo, TodoFilter } from '../types/todo';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  filter: TodoFilter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const emptyMessages: Record<TodoFilter, string> = {
  all: 'Your list is clear. Add a task to get started.',
  active: 'No active tasks right now. Nicely done!',
  completed: 'No completed tasks yet.',
};

// PUBLIC_INTERFACE
/**
 * Renders visible tasks or a context-specific empty state.
 */
export function TodoList({ todos, filter, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <section aria-live="polite" className="empty-state">
        <p>{emptyMessages[filter]}</p>
      </section>
    );
  }

  return (
    <ul aria-label={`${filter} tasks`} className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          onDelete={onDelete}
          onToggle={onToggle}
          todo={todo}
        />
      ))}
    </ul>
  );
}
