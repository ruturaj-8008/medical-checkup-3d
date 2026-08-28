import { useEffect, useMemo, useState } from 'react';
import TaskFilters from './components/TaskFilters';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { loadTasks, saveTasks } from './lib/taskStorage';
import type { Task, TaskFilter } from './types/task';

function createTaskId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Provides a responsive, browser-local task manager. */
function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filter, setFilter] = useState<TaskFilter>('all');

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

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

  function addTask(title: string): boolean {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return false;
    }

    setTasks((currentTasks) => [
      {
        id: createTaskId(),
        title: trimmedTitle,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...currentTasks,
    ]);

    return true;
  }

  function toggleTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function saveTaskTitle(taskId: string, title: string) {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, title: trimmedTitle } : task,
      ),
    );
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  function clearCompletedTasks() {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
  }

  return (
    <main className="todo-app">
      <section className="todo-card" aria-labelledby="app-title">
        <header className="app-header">
          <p className="eyebrow">Local-first task manager</p>
          <h1 id="app-title">Focus on what matters.</h1>
          <p className="intro">Your tasks stay in this browser, ready whenever you return.</p>
        </header>

        <TaskForm onAddTask={addTask} />

        <TaskFilters
          activeCount={activeCount}
          completedCount={completedCount}
          filter={filter}
          onFilterChange={setFilter}
        />

        <TaskList
          filter={filter}
          tasks={visibleTasks}
          onDelete={deleteTask}
          onSaveTitle={saveTaskTitle}
          onToggle={toggleTask}
        />

        {completedCount > 0 && (
          <footer className="app-footer">
            <button type="button" className="clear-button" onClick={clearCompletedTasks}>
              Clear completed
            </button>
          </footer>
        )}
      </section>
    </main>
  );
}

export default App;
