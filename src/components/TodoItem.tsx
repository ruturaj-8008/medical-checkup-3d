import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import type { Todo } from '../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}

function TodoItem({ todo, onToggle, onUpdate, onRemove }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(todo.text);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing]);

  const cancelEdit = () => {
    setDraftText(todo.text);
    setIsEditing(false);
  };

  const saveEdit = () => {
    const trimmedText = draftText.trim();

    if (trimmedText) {
      onUpdate(todo.id, trimmedText);
      setIsEditing(false);
    }
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEdit();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      cancelEdit();
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'is-completed' : ''}`}>
      <button
        className="completion-toggle"
        type="button"
        aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'complete'}`}
        aria-pressed={todo.completed}
        onClick={() => onToggle(todo.id)}
      >
        <span aria-hidden="true">{todo.completed ? '✓' : ''}</span>
      </button>

      {isEditing ? (
        <div className="edit-area">
          <label className="sr-only" htmlFor={`edit-${todo.id}`}>
            Edit task
          </label>
          <input
            ref={editInputRef}
            id={`edit-${todo.id}`}
            className="edit-input"
            type="text"
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            onKeyDown={handleEditKeyDown}
          />
          <button className="text-button save-button" type="button" onClick={saveEdit}>
            Save
          </button>
          <button className="text-button" type="button" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      ) : (
        <>
          <span className="todo-text">{todo.text}</span>
          <div className="todo-actions">
            <button className="icon-button" type="button" onClick={() => setIsEditing(true)}>
              Edit<span className="sr-only"> "{todo.text}"</span>
            </button>
            <button
              className="icon-button delete-button"
              type="button"
              onClick={() => onRemove(todo.id)}
            >
              Delete<span className="sr-only"> "{todo.text}"</span>
            </button>
          </div>
        </>
      )}
    </li>
  );
}

export default TodoItem;
