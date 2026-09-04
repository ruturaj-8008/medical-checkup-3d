import type { TaskFilter } from '../types/todo';

interface TaskFiltersProps {
  activeCount: number;
  completedCount: number;
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

const filters: Array<{ label: string; value: TaskFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

// PUBLIC_INTERFACE
export function TaskFilters({
  activeCount,
  completedCount,
  filter,
  onFilterChange,
}: TaskFiltersProps) {
  /** Renders the task-list view controls and summary counts. */
  return (
    <div className="filter-bar">
      <div aria-label="Task filters" className="filter-controls" role="group">
        {filters.map(({ label, value }) => (
          <button
            aria-pressed={filter === value}
            className={filter === value ? 'filter-button is-selected' : 'filter-button'}
            key={value}
            type="button"
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="filter-count">
        {activeCount} active · {completedCount} done
      </p>
    </div>
  );
}
