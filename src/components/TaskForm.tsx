import { FormEvent, useState } from 'react';

interface TaskFormProps {
  onAddTask: (title: string) => boolean;
}

/** Renders the controlled form used to add a task. */
export default function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (onAddTask(title)) {
      setTitle('');
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="new-task">
        New task
      </label>
      <input
        id="new-task"
        name="new-task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What needs your attention?"
        autoComplete="off"
      />
      <button type="submit">Add task</button>
    </form>
  );
}
