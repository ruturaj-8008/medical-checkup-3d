import type { Task, TaskFilter } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  filter: TaskFilter;
  onDelete: (taskId: string) => void;
  onSaveTitle: (taskId: string, title: string) => void;
  onToggle: (taskId: string) => void;
  tasks: Task[];
}

/** Renders the visible task list or a meaningful state-specific empty message. */
export default function TaskList({
  filter,
  onDelete,
  onSaveTitle,
  onToggle,
  tasks,
}: TaskListProps) {
  if (tasks.length === 0) {
    const messages: Record<TaskFilter, string> = {
      all: 'Your list is clear. Add a task to get started.',
      active: 'No active tasks right now. Nice work.',
      completed: 'No completed tasks yet.',
    };

    return <p className="empty-state">{messages[filter]}</p>;
  }

  return (
    <ul className="task-list" aria-label={`${filter} tasks`}>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDelete}
          onSaveTitle={onSaveTitle}
          onToggle={onToggle}
        />
      ))}
    </ul>
  );
}
