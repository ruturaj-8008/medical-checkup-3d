import { useEffect, useMemo, useReducer, useState } from 'react';
import './App.css';
import TodoFilters from './components/TodoFilters';
import TodoFooter from './components/TodoFooter';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import { loadTodos, saveTodos } from './lib/todoStorage';
import type { Todo, TodoAction, TodoFilter } from './types/todo';

function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case 'hydrate':
      return action.todos;
    case 'add':
      return [action.todo, ...state];
    case 'toggle':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, completed: !todo.completed } : todo,
      );
    case 'update':
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, text: action.text } : todo,
      );
    case 'remove':
      return state.filter((todo) => todo.id !== action.id);
    case 'clearCompleted':
      return state.filter((todo) => !todo.completed);
  }
}

function createTodoId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function App() {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [activeFilter, setActiveFilter] = useState<TodoFilter>('all');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    dispatch({ type: 'hydrate', todos: loadTodos() });
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      saveTodos(todos);
    }
  }, [isHydrated, todos]);

  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (activeFilter === 'active') {
          return !todo.completed;
        }

        if (activeFilter === 'completed') {
          return todo.completed;
        }

        return true;
      }),
    [activeFilter, todos],
  );

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  const handleAdd = (text: string) => {
    dispatch({
      type: 'add',
      todo: {
        id: createTodoId(),
        text,
        completed: false,
        createdAt: Date.now(),
      },
    });
  };

  return (
    <main className="todo-app">
      <section className="todo-card" aria-labelledby="todo-title">
        <header className="todo-header">
          <p className="eyebrow">My day</p>
          <h1 id="todo-title">Things to do</h1>
          <p className="subtitle">Keep your next steps simple and in view.</p>
        </header>

        <TodoForm onAdd={handleAdd} />

        <div className="list-header">
          <h2>Tasks</h2>
          <TodoFilters activeFilter={activeFilter} onChange={setActiveFilter} />
        </div>

        <TodoList
          todos={visibleTodos}
          activeFilter={activeFilter}
          onToggle={(id) => dispatch({ type: 'toggle', id })}
          onUpdate={(id, text) => dispatch({ type: 'update', id, text })}
          onRemove={(id) => dispatch({ type: 'remove', id })}
        />

        <TodoFooter
          activeCount={activeCount}
          completedCount={completedCount}
          onClearCompleted={() => dispatch({ type: 'clearCompleted' })}
        />
      </section>
    </main>
  );
}

export default App;
