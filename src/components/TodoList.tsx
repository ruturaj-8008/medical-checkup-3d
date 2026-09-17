import type { Task } from '../todo/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  tasks: Task[];
  isMutating: boolean;
  onDelete: (taskId: number) => Promise<void>;
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, title: string) => Promise<void>;
}

// PUBLIC_INTERFACE
/** Displays all tasks or an informative empty state. */
export function TodoList({
  tasks,
  isMutating,
  onDelete,
  onToggle,
  onUpdate,
}: TodoListProps) {
  if (tasks.length === 0) {
    return (
      <section className="empty-state" aria-live="polite">
        <span aria-hidden="true">✓</span>
        <h2>No tasks yet</h2>
        <p>Add your first task above to get started.</p>
      </section>
    );
  }

  return (
    <section className="task-list-section" aria-labelledby="task-list-heading">
      <h2 id="task-list-heading" className="visually-hidden">
        Task list
      </h2>
      <ul className="task-list">
        {tasks.map((task) => (
          <TodoItem
            key={task.id}
            task={task}
            isMutating={isMutating}
            onDelete={onDelete}
            onToggle={onToggle}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </section>
  );
}
