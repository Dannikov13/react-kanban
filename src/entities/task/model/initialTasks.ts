import type { Task } from './types';

export const initialTasks: Task[] = [
  {
    id: crypto.randomUUID(),
    title: 'Setup project',
    description: 'Configure project',
    priority: 'high',
    status: 'todo',
    createdAt: Date.now(),
  },
];
