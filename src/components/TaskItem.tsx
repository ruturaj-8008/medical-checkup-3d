import { FormEvent, useState } from 'react';
import type { Task } from '../types/task';

interface TaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onSaveTitle: (taskId: string, title: string) => void;
  onToggle: (taskId: string) => void;
}

/** Renders one task with completion, editing, and deletion controls. */
export default function TaskItem({
  task,
  onDelete,
  onSaveTitle,
  onToggle,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);

  function cancelEditing() {
    setDraftTitle(task.title);
    setIsEditing(false);
  }

  function saveEditing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextTitle = draftTitle.trim();

    if (!nextTitle) {
      return;
    }

    onSaveTitle(task.id, nextTitle);
    setIsEditing(false);
  }

  return (
    <li className={`task-item${task.completed ? ' is-complete' : ''}`}>
      <input
        id={`task-${task.id}`}
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'active' : 'complete'}`}
      />

      {isEditing ? (
        <form className="task-edit-form" onSubmit={saveEditing}>
          <label className="sr-only" htmlFor={`edit-${task.id}`}>
            Edit task
          </label>
          <input
            id={`edit-${task.id}`}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            autoFocus
          />
          <button type="submit">Save</button>
          <button type="button" className="button-quiet" onClick={cancelEditing}>
            Cancel
          </button>
        </form>
      ) : (
        <>
          <label htmlFor={`task-${task.id}`}>{task.title}</label>
          <div className="task-actions">
            <button type="button" className="button-quiet" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button
              type="button"
              className="button-danger"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete "${task.title}"`}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
}
