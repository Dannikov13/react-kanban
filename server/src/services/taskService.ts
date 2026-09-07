import { TaskRepository } from '../repositories/taskRepository.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/task.js';
import { CreateTaskData, Task, UpdateTaskPositionData } from '../types/task.js';
import { AppError } from '../errors/AppError.js';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async getTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      throw new AppError('Title is required', 400);
    }

    if (!TASK_PRIORITIES.includes(data.priority)) {
      throw new AppError('Invalid priority', 400);
    }

    if (!TASK_STATUSES.includes(data.status)) {
      throw new AppError('Invalid status', 400);
    }

    if (
      data.description !== undefined &&
      typeof data.description !== 'string'
    ) {
      throw new AppError('Invalid description', 400);
    }

    if (data.dueDate !== undefined && !Number.isFinite(data.dueDate)) {
      throw new AppError('Invalid dueDate', 400);
    }

    return await this.taskRepository.create(data);
  }

  async updateTask(id: string, data: CreateTaskData): Promise<Task> {
    if (typeof data.title !== 'string' || !data.title.trim()) {
      throw new AppError('Title is required', 400);
    }

    if (!TASK_PRIORITIES.includes(data.priority)) {
      throw new AppError('Invalid priority', 400);
    }

    if (!TASK_STATUSES.includes(data.status)) {
      throw new AppError('Invalid status', 400);
    }

    if (
      data.description !== undefined &&
      typeof data.description !== 'string'
    ) {
      throw new AppError('Invalid description', 400);
    }

    if (data.dueDate !== undefined && !Number.isFinite(data.dueDate)) {
      throw new AppError('Invalid dueDate', 400);
    }

    const task = await this.taskRepository.update(id, data);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  async deleteTask(id: string): Promise<void> {
    const deleted = await this.taskRepository.delete(id);

    if (!deleted) {
      throw new AppError('Task not found', 404);
    }
  }

  async updateTaskPositions(tasks: UpdateTaskPositionData[]): Promise<void> {
    if (!Array.isArray(tasks)) {
      throw new AppError('Invalid tasks', 400);
    }

    for (const task of tasks) {
      if (typeof task.id !== 'string' || !task.id) {
        throw new AppError('Invalid task id', 400);
      }

      if (!TASK_STATUSES.includes(task.status)) {
        throw new AppError('Invalid status', 400);
      }

      if (!Number.isInteger(task.position) || task.position < 0) {
        throw new AppError('Invalid position', 400);
      }
    }

    await this.taskRepository.updatePositions(tasks);
  }
}
