import { FormEvent, useRef, useState } from 'react';

interface TodoFormProps {
  onAdd: (text: string) => void;
}

function TodoForm({ onAdd }: TodoFormProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedText = text.trim();

    if (!trimmedText) {
      setError('Enter a task before adding it.');
      inputRef.current?.focus();
      return;
    }

    onAdd(trimmedText);
    setText('');
    setError('');
    inputRef.current?.focus();
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit} noValidate>
      <label className="sr-only" htmlFor="new-todo">
        New task
      </label>
      <input
        ref={inputRef}
        id="new-todo"
        className="todo-input"
        type="text"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          if (error) {
            setError('');
          }
        }}
        placeholder="What needs to be done?"
        aria-describedby={error ? 'todo-form-error' : undefined}
        aria-invalid={Boolean(error)}
      />
      <button className="add-button" type="submit">
        Add task
      </button>
      {error && (
        <p id="todo-form-error" className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

export default TodoForm;
