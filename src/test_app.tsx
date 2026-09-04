import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { TASK_STORAGE_KEY } from './lib/taskStorage'
import type { Task } from './types/todo'

describe('App', () => {
  it('shows validation feedback when a blank task is submitted', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter a task before adding it.')
    expect(screen.getByRole('textbox', { name: 'New task' })).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports creating, completing, editing, filtering, deleting, and clearing tasks', async () => {
    const user = userEvent.setup()

    render(<App />)

    const newTaskInput = screen.getByRole('textbox', { name: 'New task' })
    await user.type(newTaskInput, 'Plan release')
    await user.click(screen.getByRole('button', { name: 'Add task' }))
    await user.type(newTaskInput, 'Review pull request')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('2 tasks left to do.')).toBeInTheDocument()
    expect(screen.getByText('2 active · 0 done')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'Plan release' }))

    expect(screen.getByText('1 task left to do.')).toBeInTheDocument()
    expect(screen.getByText('1 active · 1 done')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Completed' }))

    expect(screen.getByRole('checkbox', { name: 'Plan release' })).toBeChecked()
    expect(screen.queryByText('Review pull request')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit Plan release' }))
    const editInput = screen.getByRole('textbox', { name: 'Edit task' })
    await user.clear(editInput)
    await user.type(editInput, 'Plan the release')
    await user.click(screen.getByRole('button', { name: 'Save task' }))

    expect(screen.getByText('Plan the release')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'All' }))
    await user.click(screen.getByRole('button', { name: 'Delete Review pull request' }))

    expect(screen.queryByText('Review pull request')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear completed' }))

    expect(screen.getByText('Your list is clear. Add a task to get started.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear completed' })).toBeDisabled()
  })

  it('hydrates tasks persisted in local storage', () => {
    const persistedTask: Task = {
      id: 'persisted-task',
      title: 'Restore after refresh',
      completed: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    }
    window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify([persistedTask]))

    render(<App />)

    expect(screen.getByRole('checkbox', { name: 'Restore after refresh' })).toBeChecked()
    expect(screen.getByText('1 completed task')).toBeInTheDocument()
  })
})
