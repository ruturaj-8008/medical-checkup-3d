import { useEffect, useReducer, useRef, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { TaskComposer } from './components/TaskComposer';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { loadTasks, saveTasks } from './lib/taskStorage';
import type { Task, TaskAction, TaskFilter } from './types/todo';

interface TodoState {
  filter: TaskFilter;
  tasks: Task[];
}

const initialState: TodoState = {
  filter: 'all',
  tasks: [],
};

/**
 * Creates an identifier for a new browser-local task.
 */
function createTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Applies immutable task state transitions for the to-do application.
 */
export function todoReducer(state: TodoState, action: TaskAction): TodoState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [
          {
            id: createTaskId(),
            title: action.title,
            completed: false,
            createdAt: new Date().toISOString(),
          },
          ...state.tasks,
        ],
      };
    case 'toggle':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, completed: !task.completed } : task,
        ),
      };
    case 'edit':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, title: action.title } : task,
        ),
      };
    case 'delete':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) };
    case 'clearCompleted':
      return { ...state, tasks: state.tasks.filter((task) => !task.completed) };
    case 'setFilter':
      return { ...state, filter: action.filter };
  }
}

// PUBLIC_INTERFACE
function App() {
  /** Renders the browser-local to-do application. */
  const [state, dispatch] = useReducer(todoReducer, initialState, () => ({
    ...initialState,
    tasks: loadTasks(),
  }));
  const [composerError, setComposerError] = useState('');
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Do not overwrite malformed or inaccessible storage during initial hydration.
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }

    saveTasks(state.tasks);
  }, [state.tasks]);

  const activeCount = state.tasks.filter((task) => !task.completed).length;
  const completedCount = state.tasks.length - activeCount;
  const visibleTasks = state.tasks.filter((task) => {
    if (state.filter === 'active') {
      return !task.completed;
    }
    if (state.filter === 'completed') {
      return task.completed;
    }
    return true;
  });

  const handleAddTask = (title: string) => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setComposerError('Please enter a task before adding it.');
      return false;
    }

    dispatch({ type: 'add', title: trimmedTitle });
    setComposerError('');
    return true;
  };

  return (
    <main className="todo-page">
      <section className="todo-card" aria-labelledby="todo-title">
        <header className="todo-header">
          <div className="brand-mark" aria-hidden="true">
            <ClipboardList size={25} strokeWidth={2.25} />
          </div>
          <div>
            <p className="eyebrow">A calmer way to plan</p>
            <h1 id="todo-title">Today&apos;s tasks</h1>
            <p className="subtitle">
              {activeCount === 0
                ? 'Everything is up to date.'
                : `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} left to do.`}
            </p>
          </div>
        </header>

        <TaskComposer error={composerError} onAddTask={handleAddTask} />
        <TaskFilters
          activeCount={activeCount}
          completedCount={completedCount}
          filter={state.filter}
          onFilterChange={(filter) => dispatch({ type: 'setFilter', filter })}
        />
        <TaskList
          tasks={visibleTasks}
          filter={state.filter}
          onDelete={(id) => dispatch({ type: 'delete', id })}
          onEdit={(id, title) => dispatch({ type: 'edit', id, title })}
          onToggle={(id) => dispatch({ type: 'toggle', id })}
        />

        <footer className="todo-footer">
          <span aria-live="polite">
            {completedCount} {completedCount === 1 ? 'completed task' : 'completed tasks'}
          </span>
          <button
            className="text-button"
            disabled={completedCount === 0}
            type="button"
            onClick={() => dispatch({ type: 'clearCompleted' })}
          >
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}

export default App;
