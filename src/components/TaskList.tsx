import { TaskItem } from './TaskItem';
import type { Task, TaskFilter } from '../types/todo';

interface TaskListProps {
  filter: TaskFilter;
  tasks: Task[];
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onToggle: (id: string) => void;
}

const emptyMessages: Record<TaskFilter, string> = {
  all: 'Your list is clear. Add a task to get started.',
  active: 'No active tasks. Enjoy the moment!',
  completed: 'No completed tasks just yet.',
};

// PUBLIC_INTERFACE
export function TaskList({ filter, tasks, onDelete, onEdit, onToggle }: TaskListProps) {
  /** Renders visible tasks or a filter-aware empty state. */
  if (tasks.length === 0) {
    return <p className="empty-state">{emptyMessages[filter]}</p>;
  }

  return (
    <ul className="task-list" aria-label={`${filter} tasks`}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}
