import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Check, ClipboardList, Pencil, Plus, Trash2, X } from 'lucide-react';

type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'todo-app.todos';

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

/**
 * Returns true only for records that can safely be rendered as persisted todos.
 */
function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.text === 'string' &&
    candidate.text.trim().length > 0 &&
    typeof candidate.completed === 'boolean' &&
    typeof candidate.createdAt === 'number'
  );
}

/**
 * Loads valid todos from browser storage without allowing unavailable or corrupt storage to break rendering.
 */
function loadTodos(): Todo[] {
  try {
    const savedTodos = window.localStorage.getItem(STORAGE_KEY);

    if (!savedTodos) {
      return [];
    }

    const parsedTodos: unknown = JSON.parse(savedTodos);

    if (!Array.isArray(parsedTodos) || !parsedTodos.every(isTodo)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    return parsedTodos;
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }

    return [];
  }
}

// PUBLIC_INTERFACE
function App() {
  /** Renders a local-first task workspace with persistent todo management. */
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [filter, setFilter] = useState<Filter>('all');
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      // The app remains fully usable for the current browser session if persistence is unavailable.
    }
  }, [todos]);

  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filter === 'active') {
          return !todo.completed;
        }

        if (filter === 'completed') {
          return todo.completed;
        }

        return true;
      }),
    [filter, todos],
  );

  const activeTodoCount = todos.filter((todo) => !todo.completed).length;
  const completedTodoCount = todos.length - activeTodoCount;

  const addTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = newTodoText.trim();

    if (!trimmedText) {
      return;
    }

    setTodos((currentTodos) => [
      {
        id: crypto.randomUUID(),
        text: trimmedText,
        completed: false,
        createdAt: Date.now(),
      },
      ...currentTodos,
    ]);
    setNewTodoText('');
  };

  const toggleTodo = (todoId: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (todoId: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId));

    if (editingTodoId === todoId) {
      setEditingTodoId(null);
      setEditingText('');
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingText(todo.text);
  };

  const cancelEditing = () => {
    setEditingTodoId(null);
    setEditingText('');
  };

  const saveEdit = (event: FormEvent<HTMLFormElement>, todoId: string) => {
    event.preventDefault();

    const trimmedText = editingText.trim();

    if (!trimmedText) {
      return;
    }

    setTodos((currentTodos) =>
      currentTodos.map((todo) => (todo.id === todoId ? { ...todo, text: trimmedText } : todo)),
    );
    cancelEditing();
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      cancelEditing();
    }
  };

  const clearCompleted = () => {
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  };

  return (
    <main className="todo-app">
      <section className="todo-card" aria-labelledby="app-title">
        <header className="app-header">
          <div className="brand-mark" aria-hidden="true">
            <Check size={22} strokeWidth={3} />
          </div>
          <div>
            <p className="eyebrow">Personal workspace</p>
            <h1 id="app-title">Today&apos;s tasks</h1>
          </div>
          <p className="completion-summary" aria-label={`${completedTodoCount} completed tasks`}>
            <strong>{completedTodoCount}</strong> completed
          </p>
        </header>

        <form className="add-todo-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="new-todo">
            Add a task
          </label>
          <input
            id="new-todo"
            value={newTodoText}
            onChange={(event) => setNewTodoText(event.target.value)}
            placeholder="What needs to get done?"
            autoComplete="off"
          />
          <button className="add-button" type="submit">
            <Plus size={20} aria-hidden="true" />
            Add task
          </button>
        </form>

        <nav className="filter-bar" aria-label="Filter tasks">
          {filters.map(({ id, label }) => {
            const count =
              id === 'all' ? todos.length : id === 'active' ? activeTodoCount : completedTodoCount;

            return (
              <button
                className={`filter-button ${filter === id ? 'is-active' : ''}`}
                type="button"
                key={id}
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label}
                <span aria-hidden="true">{count}</span>
              </button>
            );
          })}
        </nav>

        <section className="todo-list-section" aria-live="polite">
          {visibleTodos.length === 0 ? (
            <div className="empty-state">
              <ClipboardList size={38} aria-hidden="true" />
              <h2>{todos.length === 0 ? 'Your list is clear' : `No ${filter} tasks`}</h2>
              <p>
                {todos.length === 0
                  ? 'Add a task above to start shaping your day.'
                  : 'Try another filter to see the rest of your tasks.'}
              </p>
            </div>
          ) : (
            <ul className="todo-list" aria-label={`${filter} tasks`}>
              {visibleTodos.map((todo) => (
                <li className={`todo-item ${todo.completed ? 'is-completed' : ''}`} key={todo.id}>
                  {editingTodoId === todo.id ? (
                    <form className="edit-form" onSubmit={(event) => saveEdit(event, todo.id)}>
                      <label className="sr-only" htmlFor={`edit-${todo.id}`}>
                        Edit task
                      </label>
                      <input
                        id={`edit-${todo.id}`}
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        onKeyDown={handleEditKeyDown}
                        autoFocus
                      />
                      <button className="icon-button save-button" type="submit" aria-label="Save task">
                        <Check size={18} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-button"
                        type="button"
                        onClick={cancelEditing}
                        aria-label="Cancel editing"
                      >
                        <X size={18} aria-hidden="true" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <label className="todo-toggle">
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => toggleTodo(todo.id)}
                          aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'complete'}`}
                        />
                        <span aria-hidden="true">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      </label>
                      <p className="todo-text">{todo.text}</p>
                      <div className="todo-actions">
                        <button
                          className="icon-button"
                          type="button"
                          onClick={() => startEditing(todo)}
                          aria-label={`Edit "${todo.text}"`}
                        >
                          <Pencil size={17} aria-hidden="true" />
                        </button>
                        <button
                          className="icon-button delete-button"
                          type="button"
                          onClick={() => deleteTodo(todo.id)}
                          aria-label={`Delete "${todo.text}"`}
                        >
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="list-footer">
          <p>
            <strong>{activeTodoCount}</strong> {activeTodoCount === 1 ? 'task' : 'tasks'} remaining
          </p>
          <button
            className="clear-button"
            type="button"
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
