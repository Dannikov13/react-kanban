import { create } from 'zustand';
import type { CreateTaskData, Task } from '@/entities/task';
import {
  createTask as createTaskApi,
  deleteTask as deleteTaskApi,
  getTasks,
  updateTask as updateTaskApi,
  updateTaskPositions,
} from '@/shared/api/taskApi.ts';

type TaskStore = {
  tasks: Task[];
  loadTasks: () => Promise<void>;
  updateTask: (taskId: Task['id'], updatedData: Partial<Task>) => Promise<void>;
  createTask: (data: CreateTaskData) => Promise<void>;
  deleteTask: (taskId: Task['id']) => Promise<void>;
  saveTaskPositions: (updatedTasks: Task[]) => Promise<void>;
};

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],

  createTask: async (data) => {
    const newTask = await createTaskApi(data);

    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  loadTasks: async () => {
    const tasks = await getTasks();

    set({ tasks });
  },

  updateTask: async (taskId, updatedData) => {
    const updatedTask = await updateTaskApi(taskId, updatedData);

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    }));
  },

  deleteTask: async (taskId: Task['id']) => {
    await deleteTaskApi(taskId);
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    }));
  },

  saveTaskPositions: async (updatedTasks) => {
    const previousTasks = useTaskStore.getState().tasks;

    set({ tasks: updatedTasks });

    try {
      await updateTaskPositions(
        updatedTasks.map(({ id, status, position }) => ({
          id,
          status,
          position,
        })),
      );
    } catch (error) {
      set({ tasks: previousTasks });
      throw error;
    }
  },
}));
