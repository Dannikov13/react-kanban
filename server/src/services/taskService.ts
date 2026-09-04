import { TaskRepository } from '../repositories/taskRepository.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/task.js';
import { CreateTaskData, Task } from '../types/task.js';
import { AppError } from '../errors/AppError.js';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  async getTasks(): Promise<Task[]> {
    return this.taskRepository.findAll();
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    if (!data.title.trim()) {
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

    if (data.dueDate !== undefined && typeof data.dueDate !== 'number') {
      throw new AppError('Invalid dueDate', 400);
    }

    return await this.taskRepository.create(data);
  }

  async updateTask(id: string, data: CreateTaskData): Promise<Task> {
    if (!data.title.trim()) {
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

    if (data.dueDate !== undefined && typeof data.dueDate !== 'number') {
      throw new AppError('Invalid dueDate', 400);
    }

    return await this.taskRepository.update(id, data);
  }

  async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
