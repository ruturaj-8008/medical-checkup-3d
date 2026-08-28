import type { TodoFilter } from '../types/todo';

interface TodoFiltersProps {
  activeFilter: TodoFilter;
  onChange: (filter: TodoFilter) => void;
}

const filters: Array<{ label: string; value: TodoFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

function TodoFilters({ activeFilter, onChange }: TodoFiltersProps) {
  return (
    <div className="filter-group" aria-label="Filter tasks">
      {filters.map(({ label, value }) => (
        <button
          key={value}
          className={`filter-button ${activeFilter === value ? 'is-active' : ''}`}
          type="button"
          aria-pressed={activeFilter === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default TodoFilters;
