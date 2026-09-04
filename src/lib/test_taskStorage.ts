import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadTasks, saveTasks, TASK_STORAGE_KEY } from './taskStorage'
import type { Task } from '../types/todo'

const storedTask: Task = {
  id: 'task-1',
  title: 'Write tests',
  completed: false,
  createdAt: '2026-01-01T00:00:00.000Z',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('taskStorage', () => {
  it('loads valid tasks and discards invalid array members', () => {
    window.localStorage.setItem(
      TASK_STORAGE_KEY,
      JSON.stringify([
        storedTask,
        { ...storedTask, id: 42 },
        { ...storedTask, id: 'empty-title', title: '   ' },
      ]),
    )

    expect(loadTasks()).toEqual([storedTask])
  })

  it('returns an empty list when persisted data is malformed or not a task array', () => {
    window.localStorage.setItem(TASK_STORAGE_KEY, '{not valid JSON')

    expect(loadTasks()).toEqual([])

    window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify({ tasks: [storedTask] }))

    expect(loadTasks()).toEqual([])
  })

  it('returns an empty list when storage reads fail', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage is unavailable')
    })

    expect(loadTasks()).toEqual([])
  })

  it('serializes tasks and tolerates storage write failures', () => {
    saveTasks([storedTask])

    expect(window.localStorage.getItem(TASK_STORAGE_KEY)).toBe(JSON.stringify([storedTask]))

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is full')
    })

    expect(() => saveTasks([storedTask])).not.toThrow()
  })
})
