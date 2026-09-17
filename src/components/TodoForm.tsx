import { FormEvent, useState } from 'react';

interface TodoFormProps {
  isSubmitting: boolean;
  onCreate: (title: string) => Promise<void>;
}

// PUBLIC_INTERFACE
/** Renders the labelled form used to create a new task. */
export function TodoForm({ isSubmitting, onCreate }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setValidationError('Enter a task title before adding it.');
      return;
    }

    setValidationError(null);
    await onCreate(trimmedTitle);
    setTitle('');
  };

  return (
    <div className="task-form-card">
      <form className="task-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="new-task">What needs to be done?</label>
        <div className="task-form-controls">
          <input
            id="new-task"
            name="new-task"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a task"
            autoComplete="off"
            aria-describedby={validationError ? 'new-task-error' : undefined}
            aria-invalid={Boolean(validationError)}
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Add task'}
          </button>
        </div>
        {validationError && (
          <p className="field-error" id="new-task-error" role="alert">
            {validationError}
          </p>
        )}
      </form>
    </div>
  );
}
