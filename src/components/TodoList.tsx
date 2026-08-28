import type { Todo, TodoFilter } from '../types/todo';
import TodoItem from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  activeFilter: TodoFilter;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

function TodoList({ todos, activeFilter, onToggle, onUpdate, onRemove }: TodoListProps) {
  if (todos.length === 0) {
    const emptyMessage =
      activeFilter === 'all'
        ? 'Your task list is clear. Add something you want to remember.'
        : `No ${activeFilter} tasks right now.`;

    return (
      <div className="empty-state" role="status">
        <span className="empty-state-icon" aria-hidden="true">☀</span>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="todo-list" aria-label={`${activeFilter} tasks`}>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}

export default TodoList;
