export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: number;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt?: number;
}
