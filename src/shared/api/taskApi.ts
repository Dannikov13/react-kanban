import type { CreateTaskData, Task } from '@/entities/task';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
);
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

type UpdateTaskPosition = Pick<Task, 'id' | 'status' | 'position'>;

export const getTasks = async (): Promise<Task[]> => {
  const response = await fetch(apiUrl('/api/tasks'));

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return response.json();
};

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await fetch(apiUrl('/api/tasks'), {
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

export const updateTask = async (
  taskId: Task['id'],
  data: Partial<Task>,
): Promise<Task> => {
  const response = await fetch(apiUrl(`/api/tasks/${taskId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update task');
  }

  return response.json();
};

export const deleteTask = async (taskId: Task['id']): Promise<void> => {
  const response = await fetch(apiUrl(`/api/tasks/${taskId}`), {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};

export const updateTaskPositions = async (
  tasks: UpdateTaskPosition[],
): Promise<void> => {
  const response = await fetch(apiUrl('/api/tasks/positions'), {
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
