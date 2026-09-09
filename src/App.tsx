import { useEffect, useMemo, useState, type FormEvent } from 'react';
import './App.css';

type Filter = 'all' | 'active' | 'completed';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'todo-app.tasks';

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === 'string' &&
    todo.id.length > 0 &&
    typeof todo.title === 'string' &&
    todo.title.trim().length > 0 &&
    typeof todo.completed === 'boolean' &&
    typeof todo.createdAt === 'number' &&
    Number.isFinite(todo.createdAt)
  );
}

function loadTodos(): Todo[] {
  try {
    const savedTodos = window.localStorage.getItem(STORAGE_KEY);

    if (!savedTodos) {
      return [];
    }

    const parsedTodos: unknown = JSON.parse(savedTodos);
    return Array.isArray(parsedTodos) ? parsedTodos.filter(isTodo) : [];
  } catch {
    // Storage can be blocked, full, or contain malformed data. The app remains usable in memory.
    return [];
  }
}

function createTodoId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// PUBLIC_INTERFACE
/**
 * Renders a browser-local task manager with filtering and resilient localStorage persistence.
 *
 * @returns The interactive to-do application interface.
 */
function App() {
  const [tasks, setTasks] = useState<Todo[]>(loadTodos);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Keep state in memory if browser storage is unavailable.
    }
  }, [tasks]);

  const activeTaskCount = useMemo(
    () => tasks.filter((task) => !task.completed).length,
    [tasks],
  );

  const completedTaskCount = tasks.length - activeTaskCount;

  const visibleTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.completed);
    }

    if (filter === 'completed') {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }, [filter, tasks]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTaskTitle.trim();
    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: createTodoId(),
        title,
        completed: false,
        createdAt: Date.now(),
      },
      ...currentTasks,
    ]);
    setNewTaskTitle('');
  };

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  };

  const clearCompletedTasks = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  };

  const taskCountLabel =
    activeTaskCount === 1 ? '1 task remaining' : `${activeTaskCount} tasks remaining`;

  return (
    <main className="todo-page">
      <section className="todo-card" aria-labelledby="todo-heading">
        <header className="todo-header">
          <p className="eyebrow">Personal workspace</p>
          <h1 id="todo-heading">My tasks</h1>
          <p className="todo-intro">
            Keep track of what matters and make progress one task at a time.
          </p>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-task">
            Add a task
          </label>
          <input
            id="new-task"
            className="task-input"
            type="text"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
          />
          <button className="add-button" type="submit">
            Add task
          </button>
        </form>

        <div className="task-toolbar">
          <p className="task-count" aria-live="polite">
            {taskCountLabel}
          </p>
          <div className="filter-controls" aria-label="Filter tasks">
            {(['all', 'active', 'completed'] as Filter[]).map((filterOption) => (
              <button
                className={`filter-button${filter === filterOption ? ' is-selected' : ''}`}
                type="button"
                key={filterOption}
                aria-pressed={filter === filterOption}
                onClick={() => setFilter(filterOption)}
              >
                {filterOption[0].toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {visibleTasks.length > 0 ? (
          <ul className="task-list" aria-label={`${filter} tasks`}>
            {visibleTasks.map((task) => (
              <li className={`task-item${task.completed ? ' is-completed' : ''}`} key={task.id}>
                <label className="task-label">
                  <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="custom-checkbox" aria-hidden="true" />
                  <span className="task-title">{task.title}</span>
                </label>
                <button
                  className="delete-button"
                  type="button"
                  aria-label={`Delete task: ${task.title}`}
                  onClick={() => deleteTask(task.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <p>{tasks.length === 0 ? 'Your list is clear.' : `No ${filter} tasks.`}</p>
            <span>
              {tasks.length === 0
                ? 'Add a task above to get started.'
                : 'Choose another filter to see more tasks.'}
            </span>
          </div>
        )}

        <footer className="todo-footer">
          <span>
            {completedTaskCount === 0
              ? 'No completed tasks yet'
              : `${completedTaskCount} completed`}
          </span>
          <button
            className="clear-button"
            type="button"
            onClick={clearCompletedTasks}
            disabled={completedTaskCount === 0}
          >
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}

export default App;
