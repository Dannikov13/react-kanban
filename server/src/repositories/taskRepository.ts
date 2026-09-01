import { CreateTaskData, Task } from '../types/task.js';

export class TaskRepository {
  private tasks: Task[] = [
    {
      id: '1',
      title: 'Learn backend',
      description: 'Continue working on the Kanban backend',
      priority: 'high',
      status: 'in-progress',
      createdAt: Date.now(),
    },
    {
      id: '2',
      title: 'Connect database',
      priority: 'medium',
      status: 'todo',
      createdAt: Date.now(),
    },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  create(data: CreateTaskData): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: Date.now(),
    };

    this.tasks.push(task);

    return task;
  }
}
