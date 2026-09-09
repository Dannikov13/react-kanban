import type { CreateTaskData, Task } from '@/entities/task';

type UpdateTaskPosition = Pick<Task, 'id' | 'status' | 'position'>;

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch('/api/tasks');

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return response.json();
};

export const updateTaskPositions = async (
  tasks: UpdateTaskPosition[],
): Promise<void> => {
  const response = await fetch('/api/tasks/positions', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tasks }),
  });

  if (!response.ok) {
    throw new Error('Failed to update task positions');
  }
};
