import { TaskRepository } from '../repositories/taskRepository.js';
import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/task.js';
import { CreateTaskData, Task } from '../types/task.js';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  getTasks(): Task[] {
    return this.taskRepository.findAll();
  }

  createTask(data: CreateTaskData): Task {
    if (!data.title.trim()) {
      throw new Error('Title is required');
    }

    if (!TASK_PRIORITIES.includes(data.priority)) {
      throw new Error('Invalid priority');
    }

    if (!TASK_STATUSES.includes(data.status)) {
      throw new Error('Invalid status');
    }
    if (
      data.description !== undefined &&
      typeof data.description !== 'string'
    ) {
      throw new Error('Invalid description');
    }
    if (data.dueDate !== undefined && typeof data.dueDate !== 'number') {
      throw new Error('Invalid dueDate');
    }

    return this.taskRepository.create(data);
  }
}
