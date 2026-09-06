import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, ListTodo, Trash2 } from 'lucide-react';
import './App.css';

type Filter = 'all' | 'active' | 'completed';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'todo-app.tasks.v1';

const filters: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'number'
  );
}

function loadTasks(): Task[] {
  try {
    const savedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (!savedTasks) {
      return [];
    }

    const parsedTasks: unknown = JSON.parse(savedTasks);
    return Array.isArray(parsedTasks) && parsedTasks.every(isTask) ? parsedTasks : [];
  } catch {
    // Storage can be unavailable or contain malformed data; the app remains usable.
    return [];
  }
}

function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// PUBLIC_INTERFACE
/** Renders a responsive, browser-persisted task list and its task-management controls. */
function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [draftTitle, setDraftTitle] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<Filter>('all');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Keep in-memory behavior available when storage is blocked or quota-limited.
    }
  }, [tasks]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (selectedFilter === 'active') {
          return !task.completed;
        }

        if (selectedFilter === 'completed') {
          return task.completed;
        }

        return true;
      }),
    [selectedFilter, tasks],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = draftTitle.trim();
    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      {
        id: createTaskId(),
        title,
        completed: false,
        createdAt: Date.now(),
      },
      ...currentTasks,
    ]);
    setDraftTitle('');
  };

  const toggleTask = (taskId: string) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const clearCompletedTasks = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  };

  return (
    <main className="todo-app">
      <section className="todo-card" aria-labelledby="app-title">
        <header className="todo-header">
          <div className="brand-mark" aria-hidden="true">
            <ListTodo size={22} strokeWidth={2.5} />
          </div>
          <div>
            <p className="eyebrow">Your daily focus</p>
            <h1 id="app-title">Today&apos;s tasks</h1>
          </div>
          <p className="task-summary" aria-label={`${activeCount} active tasks`}>
            <strong>{activeCount}</strong> {activeCount === 1 ? 'task' : 'tasks'} left
          </p>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-task">
            Add a new task
          </label>
          <input
            id="new-task"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
          />
          <button className="add-button" type="submit" disabled={!draftTitle.trim()}>
            Add task
          </button>
        </form>

        <div className="task-toolbar">
          <div className="filter-group" aria-label="Filter tasks">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-button ${selectedFilter === filter.id ? 'is-selected' : ''}`}
                type="button"
                aria-pressed={selectedFilter === filter.id}
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            className="clear-button"
            type="button"
            disabled={completedCount === 0}
            onClick={clearCompletedTasks}
          >
            Clear completed
          </button>
        </div>

        <p className="results-summary" aria-live="polite">
          {visibleTasks.length === 0
            ? 'No tasks in this view'
            : `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'} shown`}
        </p>

        {visibleTasks.length > 0 ? (
          <ul className="task-list" aria-label={`${selectedFilter} tasks`}>
            {visibleTasks.map((task) => (
              <li className={`task-item ${task.completed ? 'is-completed' : ''}`} key={task.id}>
                <label className="task-toggle">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                  <span className="checkbox-indicator" aria-hidden="true">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  <span className="task-title">{task.title}</span>
                </label>
                <button
                  className="delete-button"
                  type="button"
                  aria-label={`Delete task: ${task.title}`}
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              <Check size={24} />
            </span>
            <h2>{tasks.length === 0 ? 'Your list is clear' : 'Nothing here yet'}</h2>
            <p>
              {tasks.length === 0
                ? 'Add a task above to make space for what matters.'
                : 'Try selecting a different filter to see your tasks.'}
            </p>
          </div>
        )}

        <footer className="todo-footer">
          <span>
            {completedCount} {completedCount === 1 ? 'completed task' : 'completed tasks'}
          </span>
          <span>Saved automatically on this device</span>
        </footer>
      </section>
    </main>
  );
}

export default App;
