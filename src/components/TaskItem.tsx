import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import type { Task } from '../types/todo';

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (id: string, title: string) => void;
  onToggle: (id: string) => void;
}

// PUBLIC_INTERFACE
export function TaskItem({ task, onDelete, onEdit, onToggle }: TaskItemProps) {
  /** Renders one task and manages its short-lived inline edit interaction. */
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [editError, setEditError] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const closeEditor = () => {
    setIsEditing(false);
    setEditError('');
    setDraftTitle(task.title);
    requestAnimationFrame(() => editButtonRef.current?.focus());
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = draftTitle.trim();

    if (!trimmedTitle) {
      setEditError('A task title cannot be empty.');
      return;
    }

    onEdit(task.id, trimmedTitle);
    setIsEditing(false);
    setEditError('');
    requestAnimationFrame(() => editButtonRef.current?.focus());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeEditor();
    }
  };

  return (
    <li className={task.completed ? 'task-item is-completed' : 'task-item'}>
      {isEditing ? (
        <form className="edit-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor={`edit-task-${task.id}`}>
            Edit task
          </label>
          <input
            ref={editInputRef}
            id={`edit-task-${task.id}`}
            aria-describedby={editError ? `edit-error-${task.id}` : undefined}
            aria-invalid={Boolean(editError)}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button aria-label="Save task" className="icon-button save-button" type="submit">
            <Check aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Cancel editing"
            className="icon-button"
            type="button"
            onClick={closeEditor}
          >
            <X aria-hidden="true" size={18} />
          </button>
          {editError ? (
            <p className="edit-error" id={`edit-error-${task.id}`} role="alert">
              {editError}
            </p>
          ) : null}
        </form>
      ) : (
        <>
          <label className="task-label">
            <input
              checked={task.completed}
              className="task-checkbox"
              type="checkbox"
              onChange={() => onToggle(task.id)}
            />
            <span className="custom-checkbox" aria-hidden="true">
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="task-title">{task.title}</span>
          </label>
          <div className="task-actions">
            <button
              ref={editButtonRef}
              aria-label={`Edit ${task.title}`}
              className="icon-button"
              type="button"
              onClick={() => setIsEditing(true)}
            >
              <Pencil aria-hidden="true" size={17} />
            </button>
            <button
              aria-label={`Delete ${task.title}`}
              className="icon-button delete-button"
              type="button"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 aria-hidden="true" size={17} />
            </button>
          </div>
        </>
      )}
    </li>
  );
}
