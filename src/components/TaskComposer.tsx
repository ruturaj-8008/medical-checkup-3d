import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus } from 'lucide-react';

interface TaskComposerProps {
  error: string;
  onAddTask: (title: string) => boolean;
}

// PUBLIC_INTERFACE
export function TaskComposer({ error, onAddTask }: TaskComposerProps) {
  /** Renders the form used to add a task to the active list. */
  const [title, setTitle] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onAddTask(title)) {
      setTitle('');
    }
  };

  return (
    <form className="task-composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="new-task">
        New task
      </label>
      <input
        id="new-task"
        aria-describedby={error ? 'task-error' : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="off"
        placeholder="What needs to be done?"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button className="primary-button" type="submit">
        <Plus aria-hidden="true" size={18} />
        Add task
      </button>
      {error ? (
        <p className="form-error" id="task-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
