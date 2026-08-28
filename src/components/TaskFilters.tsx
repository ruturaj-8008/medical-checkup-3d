import type { TaskFilter } from '../types/task';

interface TaskFiltersProps {
  activeCount: number;
  completedCount: number;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

/** Renders task-view filters and an at-a-glance task count. */
export default function TaskFilters({
  activeCount,
  completedCount,
  filter,
  onFilterChange,
}: TaskFiltersProps) {
  const filters: Array<{ label: string; value: TaskFilter }> = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="task-toolbar">
      <p className="task-count" aria-live="polite">
        {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
      </p>
      <div className="filter-controls" aria-label="Filter tasks">
        {filters.map(({ label, value }) => (
          <button
            key={value}
            type="button"
            className={filter === value ? 'is-selected' : undefined}
            aria-pressed={filter === value}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="completed-count">{completedCount} completed</p>
    </div>
  );
}
