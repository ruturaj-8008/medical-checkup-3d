import { FormEvent, useEffect, useMemo, useState } from 'react';
import './App.css';

type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'todos';

/**
 * Safely restores compatible todo records from browser storage.
 * Invalid, obsolete, or unavailable storage is treated as an empty list.
 */
function loadTodos(): Todo[] {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (item): item is Todo =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.text === 'string' &&
        typeof item.completed === 'boolean',
    );
  } catch {
    return [];
  }
}

/**
 * Persists the current todo list without allowing blocked browser storage to
 * interrupt the interactive application.
 */
function saveTodos(todos: Todo[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Browser privacy settings or storage quotas must not break todo actions.
  }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const visibleTodos = useMemo(() => {
    if (filter === 'active') {
      return todos.filter((todo) => !todo.completed);
    }

    if (filter === 'completed') {
      return todos.filter((todo) => todo.completed);
    }

    return todos;
  }, [filter, todos]);

  const activeTodoCount = todos.filter((todo) => !todo.completed).length;
  const completedTodoCount = todos.length - activeTodoCount;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = draft.trim();

    if (!text) {
      return;
    }

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: crypto.randomUUID(), text, completed: false },
    ]);
    setDraft('');
  };

  const toggleTodo = (id: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  return (
    <main className="todo-page">
      <section className="todo-card" aria-labelledby="todo-heading">
        <header className="todo-header">
          <p className="eyebrow">Personal organizer</p>
          <h1 id="todo-heading">My tasks</h1>
          <p className="todo-intro">
            Keep your day focused, one task at a time.
          </p>
        </header>

        <form className="todo-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-todo">
            Add a new task
          </label>
          <input
            id="new-todo"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
          />
          <button type="submit">Add task</button>
        </form>

        <div className="todo-toolbar">
          <p aria-live="polite">
            <strong>{activeTodoCount}</strong>{' '}
            {activeTodoCount === 1 ? 'task' : 'tasks'} left
          </p>

          <div className="filter-controls" aria-label="Filter tasks">
            {(['all', 'active', 'completed'] as Filter[]).map((filterName) => (
              <button
                key={filterName}
                type="button"
                className={filter === filterName ? 'is-selected' : ''}
                aria-pressed={filter === filterName}
                onClick={() => setFilter(filterName)}
              >
                {filterName}
              </button>
            ))}
          </div>
        </div>

        <ul className="todo-list" aria-label={`${filter} tasks`}>
          {visibleTodos.map((todo) => (
            <li key={todo.id} className={todo.completed ? 'is-complete' : ''}>
              <label className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span>{todo.text}</span>
              </label>
              <button
                className="delete-button"
                type="button"
                aria-label={`Delete ${todo.text}`}
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        {visibleTodos.length === 0 && (
          <p className="empty-state" role="status">
            {todos.length === 0
              ? 'Your task list is clear. Add something to get started.'
              : `No ${filter} tasks to show.`}
          </p>
        )}

        <footer className="todo-footer">
          <span>
            {todos.length === 0
              ? 'No tasks yet'
              : `${todos.length} ${todos.length === 1 ? 'task' : 'tasks'} total`}
          </span>
          <button
            type="button"
            className="clear-button"
            onClick={clearCompleted}
            disabled={completedTodoCount === 0}
          >
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}

export default App;
