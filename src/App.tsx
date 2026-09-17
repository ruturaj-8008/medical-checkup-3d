import { FormEvent, useCallback, useEffect, useState } from 'react';
import './App.css';
import {
  createTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
} from './api/tasks';
import { TodoForm } from './components/TodoForm';
import { TodoList } from './components/TodoList';
import type { Task } from './todo/types';

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setPageError(null);

    try {
      setTasks(await getTasks());
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Unable to load tasks. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const runMutation = async (action: () => Promise<void>) => {
    setIsMutating(true);
    setPageError(null);

    try {
      await action();
    } catch (error) {
      setPageError(
        error instanceof Error ? error.message : 'Unable to save your change. Please try again.',
      );
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreate = async (title: string) => {
    await runMutation(async () => {
      const task = await createTask({ title });
      setTasks((currentTasks) => [task, ...currentTasks]);
    });
  };

  const handleToggle = async (task: Task) => {
    await runMutation(async () => {
      const updatedTask = await toggleTask(task.id);
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    });
  };

  const handleUpdate = async (taskId: number, title: string) => {
    await runMutation(async () => {
      const updatedTask = await updateTask(taskId, { title });
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
    });
  };

  const handleDelete = async (taskId: number) => {
    await runMutation(async () => {
      await deleteTask(taskId);
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const remainingTaskCount = tasks.filter((task) => !task.completed).length;

  return (
    <main className="todo-page">
      <section className="todo-shell" aria-labelledby="page-title">
        <header className="todo-header">
          <p className="eyebrow">Simple, focused task management</p>
          <h1 id="page-title">My tasks</h1>
          <p className="todo-summary">
            {remainingTaskCount === 0
              ? 'You are all caught up.'
              : `${remainingTaskCount} ${remainingTaskCount === 1 ? 'task' : 'tasks'} remaining.`}
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <TodoForm isSubmitting={isMutating} onCreate={handleCreate} />
        </form>

        {pageError && (
          <section className="request-error" role="alert" aria-live="assertive">
            <div>
              <strong>Something went wrong.</strong>
              <p>{pageError}</p>
            </div>
            <button className="retry-button" type="button" onClick={() => void loadTasks()}>
              Try again
            </button>
          </section>
        )}

        {isLoading ? (
          <p className="status-message" role="status">
            Loading your tasks…
          </p>
        ) : (
          <TodoList
            tasks={tasks}
            isMutating={isMutating}
            onDelete={handleDelete}
            onToggle={handleToggle}
            onUpdate={handleUpdate}
          />
        )}
      </section>
    </main>
  );
}

export default App;
