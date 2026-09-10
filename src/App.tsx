import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, ListTodo, Plus, Trash2 } from 'lucide-react';

type TaskFilter = 'all' | 'active' | 'completed';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = 'todo-app.tasks';

/**
 * Returns a safe task collection from browser storage, treating unavailable,
 * malformed, and outdated values as an empty list.
 */
function loadTasks(): Task[] {
  try {
    const storedTasks = window.localStorage.getItem(STORAGE_KEY);

    if (!storedTasks) {
      return [];
    }

    const parsedTasks: unknown = JSON.parse(storedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks.filter(
      (task): task is Task =>
        typeof task === 'object' &&
        task !== null &&
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        typeof task.completed === 'boolean' &&
        typeof task.createdAt === 'number',
    );
  } catch {
    return [];
  }
}

/**
 * Creates a browser-safe identifier with a fallback for environments that do
 * not implement crypto.randomUUID.
 */
function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// PUBLIC_INTERFACE
/**
 * Renders a responsive, browser-local task list with add, complete, filter,
 * delete, and completed-task cleanup controls.
 *
 * @returns The complete to-do application interface.
 */
function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage can be disabled or full; in-memory task management still works.
    }
  }, [tasks]);

  const activeTaskCount = tasks.filter((task) => !task.completed).length;
  const completedTaskCount = tasks.length - activeTaskCount;

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === 'active') {
          return !task.completed;
        }

        if (filter === 'completed') {
          return task.completed;
        }

        return true;
      }),
    [filter, tasks],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = newTaskTitle.trim();

    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: createTaskId(),
        title,
        completed: false,
        createdAt: Date.now(),
      },
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
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const clearCompletedTasks = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  };

  return (
    <main className="todo-page">
      <section className="todo-card" aria-labelledby="todo-heading">
        <header className="todo-header">
          <div className="todo-title-group">
            <span className="todo-icon" aria-hidden="true">
              <ListTodo size={24} strokeWidth={2.4} />
            </span>
            <div>
              <p className="eyebrow">Stay organized</p>
              <h1 id="todo-heading">My tasks</h1>
            </div>
          </div>
          <p className="task-summary" aria-live="polite">
            {activeTaskCount === 1 ? '1 task left' : `${activeTaskCount} tasks left`}
          </p>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="new-task">
            Add a new task
          </label>
          <input
            id="new-task"
            type="text"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="What needs to be done?"
            autoComplete="off"
            maxLength={160}
          />
          <button className="add-button" type="submit">
            <Plus size={20} aria-hidden="true" />
            <span>Add task</span>
          </button>
        </form>

        <div className="task-content">
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
                    <span className="checkmark" aria-hidden="true">
                      <Check size={15} strokeWidth={3} />
                    </span>
                    <span className="task-title">{task.title}</span>
                  </label>
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete task: ${task.title}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state" role="status">
              <span className="empty-icon" aria-hidden="true">
                <Check size={22} />
              </span>
              <p>{tasks.length === 0 ? 'Your list is clear.' : `No ${filter} tasks.`}</p>
              <span>
                {tasks.length === 0
                  ? 'Add a task above to get started.'
                  : 'Choose another filter to see your tasks.'}
              </span>
            </div>
          )}
        </div>

        <footer className="todo-footer">
          <div className="filter-controls" aria-label="Filter tasks">
            {(['all', 'active', 'completed'] as const).map((filterOption) => (
              <button
                className={`filter-button${filter === filterOption ? ' is-active' : ''}`}
                type="button"
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                aria-pressed={filter === filterOption}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
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
