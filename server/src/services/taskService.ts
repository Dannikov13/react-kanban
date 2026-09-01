import { TaskRepository } from '../repositories/taskRepository.js';
import { CreateTaskData, Task } from '../types/task.js';

export class TaskService {
  constructor(private taskRepository: TaskRepository) {}

  getTasks(): Task[] {
    return this.taskRepository.findAll();
  }

  createTask(data: CreateTaskData): Task {
    return this.taskRepository.create(data);
  }
}
