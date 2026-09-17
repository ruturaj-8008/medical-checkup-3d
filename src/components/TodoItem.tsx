import { FormEvent, useState } from 'react';
import type { Task } from '../todo/types';

interface TodoItemProps {
  task: Task;
  isMutating: boolean;
  onDelete: (taskId: number) => Promise<void>;
  onToggle: (task: Task) => Promise<void>;
  onUpdate: (taskId: number, title: string) => Promise<void>;
}

// PUBLIC_INTERFACE
/** Renders one task with completion, edit, and deletion controls. */
export function TodoItem({
  task,
  isMutating,
  onDelete,
  onToggle,
  onUpdate,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [validationError, setValidationError] = useState<string | null>(null);

  const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = draftTitle.trim();

    if (!trimmedTitle) {
      setValidationError('A task title cannot be empty.');
      return;
    }

    setValidationError(null);
    await onUpdate(task.id, trimmedTitle);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setDraftTitle(task.title);
    setValidationError(null);
    setIsEditing(false);
  };

  return (
    <li className={`task-item${task.completed ? ' is-complete' : ''}`}>
      <input
        id={`task-${task.id}`}
        className="task-checkbox"
        type="checkbox"
        checked={task.completed}
        onChange={() => void onToggle(task)}
        disabled={isMutating}
      />

      {isEditing ? (
        <form className="task-edit-form" onSubmit={saveEdit} noValidate>
          <label className="visually-hidden" htmlFor={`task-edit-${task.id}`}>
            Edit task title
          </label>
          <input
            id={`task-edit-${task.id}`}
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            aria-describedby={validationError ? `task-edit-error-${task.id}` : undefined}
            aria-invalid={Boolean(validationError)}
            autoFocus
            disabled={isMutating}
          />
          <div className="item-actions">
            <button className="text-button save-button" type="submit" disabled={isMutating}>
              Save
            </button>
            <button className="text-button" type="button" onClick={cancelEdit} disabled={isMutating}>
              Cancel
            </button>
          </div>
          {validationError && (
            <p className="field-error" id={`task-edit-error-${task.id}`} role="alert">
              {validationError}
            </p>
          )}
        </form>
      ) : (
        <>
          <label className="task-title" htmlFor={`task-${task.id}`}>
            {task.title}
          </label>
          <div className="item-actions">
            <button
              className="text-button"
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={isMutating}
              aria-label={`Edit ${task.title}`}
            >
              Edit
            </button>
            <button
              className="text-button delete-button"
              type="button"
              onClick={() => void onDelete(task.id)}
              disabled={isMutating}
              aria-label={`Delete ${task.title}`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
