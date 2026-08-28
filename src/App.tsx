import './App.css';
import { TodoFilters } from './components/TodoFilters';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import { useTodos } from './hooks/useTodos';

function App() {
  const {
    visibleTodos,
    filter,
    setFilter,
    counts,
    addTodo,
    toggleTodo,
    deleteTodo,
  } = useTodos();

  const completedMessage =
    counts.completed === 1
      ? '1 task completed'
      : `${counts.completed} tasks completed`;

  return (
    <main className="app-shell">
      <section aria-labelledby="todo-heading" className="todo-workspace">
        <header className="workspace-header">
          <p className="eyebrow">Personal workspace</p>
          <h1 id="todo-heading">Today’s tasks</h1>
          <p className="workspace-description">
            Keep your day clear, focused, and moving forward.
          </p>
        </header>

        <TodoForm onAdd={addTodo} />

        <div className="list-toolbar">
          <TodoFilters
            counts={counts}
            onFilterChange={setFilter}
            selectedFilter={filter}
          />
          <p aria-live="polite" className="completion-summary">
            {completedMessage}
          </p>
        </div>

        <TodoList
          filter={filter}
          onDelete={deleteTodo}
          onToggle={toggleTodo}
          todos={visibleTodos}
        />
      </section>
    </main>
  );
}

export default App;
