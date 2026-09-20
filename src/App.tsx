import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';

type Filter = 'all' | 'active' | 'completed';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

const TODO_STORAGE_KEY = 'todo-app.tasks.v1';

const filters: Array<{ value: Filter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    task.id.length > 0 &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'number' &&
    Number.isFinite(task.createdAt)
  );
}

function loadTasks(): Task[] {
  try {
    const storedTasks = window.localStorage.getItem(TODO_STORAGE_KEY);
    if (!storedTasks) {
      return [];
    }

    const parsedTasks: unknown = JSON.parse(storedTasks);
    if (!Array.isArray(parsedTasks) || !parsedTasks.every(isTask)) {
      return [];
    }

    return [...parsedTasks].sort((first, second) => second.createdAt - first.createdAt);
  } catch {
    return [];
  }
}

function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// PUBLIC_INTERFACE
function App() {
  /** Renders and manages the browser-local task collection. */
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // A blocked or full storage area must not prevent task interactions.
    }
  }, [tasks]);

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );
  const activeCount = tasks.length - completedCount;

  const visibleTasks = useMemo(() => {
    if (activeFilter === 'active') {
      return tasks.filter((task) => !task.completed);
    }

    if (activeFilter === 'completed') {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }, [activeFilter, tasks]);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTaskTitle.trim();

    if (!title) {
      return;
    }

    setTasks((currentTasks) => [
      { id: createTaskId(), title, completed: false, createdAt: Date.now() },
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

  const beginEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditTitle('');
  };

  const saveEdit = (event: FormEvent<HTMLFormElement>, taskId: string) => {
    event.preventDefault();
    const title = editTitle.trim();

    if (!title) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, title } : task)),
    );
    cancelEditing();
  };

  const deleteTask = (taskId: string) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

    if (editingTaskId === taskId) {
      cancelEditing();
    }
  };

  const clearCompleted = () => {
    if (
      completedCount > 0 &&
      window.confirm(`Remove ${completedCount} completed task${completedCount === 1 ? '' : 's'}?`)
    ) {
      setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
    }
  };

  const emptyStateMessage =
    activeFilter === 'all'
      ? 'Add your first task to get started.'
      : activeFilter === 'active'
        ? 'No active tasks right now.'
        : 'No completed tasks yet.';

  return (
    <main className="todo-page">
      <section className="todo-card" aria-labelledby="todo-heading">
        <header className="todo-header">
          <div>
            <p className="eyebrow">Local-first task manager</p>
            <h1 id="todo-heading">Today, organized.</h1>
            <p className="todo-subtitle">
              Your tasks stay in this browser and are ready when you return.
            </p>
          </div>
          <div className="task-count" aria-label={`${activeCount} active tasks`}>
            <strong>{activeCount}</strong>
            <span>active</span>
          </div>
        </header>

        <form className="add-task-form" onSubmit={addTask}>
          <label className="visually-hidden" htmlFor="new-task">
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
          <button type="submit" className="primary-button">
            <Plus size={18} aria-hidden="true" />
            Add task
          </button>
        </form>

        <div className="task-toolbar">
          <div className="filter-tabs" role="group" aria-label="Filter tasks">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={activeFilter === filter.value ? 'filter-button is-selected' : 'filter-button'}
                onClick={() => setActiveFilter(filter.value)}
                aria-pressed={activeFilter === filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <p className="task-summary" aria-live="polite">
            {completedCount} of {tasks.length} completed
          </p>
        </div>

        <ul className="task-list" aria-label={`${activeFilter} tasks`}>
          {visibleTasks.map((task) => (
            <li key={task.id} className={`task-row${task.completed ? ' is-completed' : ''}`}>
              {editingTaskId === task.id ? (
                <form className="edit-task-form" onSubmit={(event) => saveEdit(event, task.id)}>
                  <label className="visually-hidden" htmlFor={`edit-${task.id}`}>
                    Edit task title
                  </label>
                  <input
                    id={`edit-${task.id}`}
                    type="text"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    autoComplete="off"
                    maxLength={160}
                    autoFocus
                  />
                  <button type="submit" className="icon-button save-button" aria-label={`Save ${task.title}`}>
                    <Check size={18} aria-hidden="true" />
                  </button>
                  <button type="button" className="icon-button" onClick={cancelEditing} aria-label="Cancel editing">
                    <X size={18} aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <>
                  <label className="task-label">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span>{task.title}</span>
                  </label>
                  <div className="task-actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => beginEditing(task)}
                      aria-label={`Edit ${task.title}`}
                    >
                      <Pencil size={17} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="icon-button delete-button"
                      onClick={() => deleteTask(task.id)}
                      aria-label={`Delete ${task.title}`}
                    >
                      <Trash2 size={17} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {visibleTasks.length === 0 && (
          <div className="empty-state" role="status">
            <span aria-hidden="true">✓</span>
            <p>{emptyStateMessage}</p>
          </div>
        )}

        {completedCount > 0 && (
          <footer className="todo-footer">
            <button type="button" className="clear-button" onClick={clearCompleted}>
              Clear completed
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}

export default App;
