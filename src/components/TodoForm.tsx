import { useState, type FormEvent } from 'react';

interface TodoFormProps {
  onAdd: (title: string) => boolean;
}

// PUBLIC_INTERFACE
/**
 * Renders the task-creation form and retains input focus after successful submission.
 */
export function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!onAdd(title)) {
      setError('Enter a task before adding it.');
      return;
    }

    setTitle('');
    setError('');
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="new-todo">
        What needs to be done?
      </label>
      <input
        id="new-todo"
        aria-describedby={error ? 'todo-form-error' : undefined}
        autoComplete="off"
        className="todo-input"
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) {
            setError('');
          }
        }}
        placeholder="What needs to be done?"
        type="text"
        value={title}
      />
      <button className="add-button" type="submit">
        Add task
      </button>
      {error && (
        <p className="form-error" id="todo-form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
