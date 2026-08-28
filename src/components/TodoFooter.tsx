interface TodoFooterProps {
  activeCount: number;
  completedCount: number;
  onClearCompleted: () => void;
}

function TodoFooter({ activeCount, completedCount, onClearCompleted }: TodoFooterProps) {
  const itemLabel = activeCount === 1 ? 'item' : 'items';

  return (
    <footer className="todo-footer">
      <p>
        <strong>{activeCount}</strong> {itemLabel} remaining
        <span aria-hidden="true"> · </span>
        <span>{completedCount} completed</span>
      </p>
      <button
        className="clear-button"
        type="button"
        disabled={completedCount === 0}
        onClick={onClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
}

export default TodoFooter;
