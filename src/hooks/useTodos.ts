import { useMemo, useState } from 'react';
import { loadTodos, saveTodos } from '../lib/todoStorage';
import type { Todo, TodoFilter } from '../types/todo';

function createTodoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `todo-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// PUBLIC_INTERFACE
/**
 * Provides local task state, derived filtered views, and persisted task mutations.
 *
 * @returns The task collection, filter state, counts, and task mutation callbacks.
 */
export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos);
  const [filter, setFilter] = useState<TodoFilter>('all');

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

  const counts = useMemo(
    () => ({
      all: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    }),
    [todos],
  );

  const updateTodos = (updater: (currentTodos: Todo[]) => Todo[]) => {
    setTodos((currentTodos) => {
      const nextTodos = updater(currentTodos);
      saveTodos(nextTodos);
      return nextTodos;
    });
  };

  const addTodo = (title: string) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return false;
    }

    updateTodos((currentTodos) => [
      {
        id: createTodoId(),
        title: normalizedTitle,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      ...currentTodos,
    ]);
    return true;
  };

  const toggleTodo = (id: string) => {
    updateTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    updateTodos((currentTodos) =>
      currentTodos.filter((todo) => todo.id !== id),
    );
  };

  return {
    todos,
    visibleTodos,
    filter,
    setFilter,
    counts,
    addTodo,
    toggleTodo,
    deleteTodo,
  };
}
