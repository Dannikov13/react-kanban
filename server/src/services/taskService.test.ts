import assert from 'node:assert/strict';
import test from 'node:test';
import { AppError } from '../errors/AppError.js';
import type { CreateTaskData, Task } from '../types/task.js';
import { TaskService } from './taskService.js';
import type { TaskRepository } from '../repositories/taskRepository.js';

const validTaskData: CreateTaskData = {
  title: 'Prepare portfolio',
  description: 'Review the Kanban project',
  priority: 'high',
  status: 'todo',
};

const makeService = (overrides: Partial<TaskRepository> = {}): TaskService => {
  const repository = {
    findAll: async () => [],
    create: async (data: CreateTaskData): Promise<Task> => ({
      id: 'task-1',
      ...data,
      createdAt: 1,
      position: 0,
    }),
    update: async () => null,
    delete: async () => false,
    updatePositions: async () => undefined,
    ...overrides,
  } as unknown as TaskRepository;

  return new TaskService(repository);
};

test('creates a task through the repository when the data is valid', async () => {
  const service = makeService();

  const task = await service.createTask(validTaskData);

  assert.equal(task.title, validTaskData.title);
  assert.equal(task.id, 'task-1');
});

test('rejects a task with a blank title', async () => {
  const service = makeService();

  await assert.rejects(
    service.createTask({ ...validTaskData, title: '   ' }),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message === 'Title is required',
  );
});

test('rejects an unsupported task status', async () => {
  const service = makeService();

  await assert.rejects(
    service.createTask({
      ...validTaskData,
      status: 'blocked' as CreateTaskData['status'],
    }),
    (error: unknown) => error instanceof AppError && error.statusCode === 400,
  );
});

test('reports a missing task when an update finds no row', async () => {
  const service = makeService({ update: async () => null });

  await assert.rejects(
    service.updateTask('missing-task', validTaskData),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 404 &&
      error.message === 'Task not found',
  );
});
