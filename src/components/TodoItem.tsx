import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

// PUBLIC_INTERFACE
/**
 * Renders one task and delegates completion and deletion actions to its parent.
 */
export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className={`todo-item ${todo.completed ? 'is-complete' : ''}`}>
      <label className="todo-label">
        <input
          aria-label={`Mark ${todo.title} as ${todo.completed ? 'active' : 'complete'}`}
          checked={todo.completed}
          className="todo-checkbox"
          onChange={() => onToggle(todo.id)}
          type="checkbox"
        />
        <span className="todo-title">{todo.title}</span>
      </label>
      <button
        aria-label={`Delete ${todo.title}`}
        className="delete-button"
        onClick={() => onDelete(todo.id)}
        type="button"
      >
        Delete
      </button>
    </li>
  );
}
