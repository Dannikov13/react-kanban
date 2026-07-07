import type { Task } from './types';

export const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Setup project',
    description: 'Configure project',
    priority: 'high',
    status: 'todo',
    createdAt: Date.now(),
  },
];
