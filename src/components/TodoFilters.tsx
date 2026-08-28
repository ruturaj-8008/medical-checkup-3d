import type { TodoFilter } from '../types/todo';

interface TodoFiltersProps {
  counts: Record<TodoFilter, number>;
  selectedFilter: TodoFilter;
  onFilterChange: (filter: TodoFilter) => void;
}

const filterLabels: Record<TodoFilter, string> = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
};

// PUBLIC_INTERFACE
/**
 * Renders task filters and makes the selected list view explicit to assistive technology.
 */
export function TodoFilters({
  counts,
  selectedFilter,
  onFilterChange,
}: TodoFiltersProps) {
  return (
    <div aria-label="Filter tasks" className="filter-group" role="group">
      {(Object.keys(filterLabels) as TodoFilter[]).map((filter) => (
        <button
          aria-pressed={selectedFilter === filter}
          className={`filter-button ${selectedFilter === filter ? 'is-selected' : ''}`}
          key={filter}
          onClick={() => onFilterChange(filter)}
          type="button"
        >
          <span>{filterLabels[filter]}</span>
          <span aria-hidden="true" className="filter-count">
            {counts[filter]}
          </span>
        </button>
      ))}
    </div>
  );
}
