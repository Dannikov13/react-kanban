import type { Task, TaskStatus } from '@/entities/task';

export const createTask = (data: Omit<Task, 'id'>): Task => {
  return {
    id: crypto.randomUUID(),
    ...data,
  };
};

export const deleteTask = (tasks: Task[], taskId: Task['id']): Task[] => {
  return tasks.filter((task) => task.id !== taskId);
};

export const updateTask = (
  tasks: Task[],
  taskId: Task['id'],
  updatedData: Partial<Task>,
): Task[] => {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          ...updatedData,
        }
      : task,
  );
};

export const moveTask = (
  tasks: Task[],
  taskId: Task['id'],
  overId: string,
): Task[] => {
  const activeTask = tasks.find((task) => task.id === taskId);

  if (!activeTask) {
    return tasks;
  }

  const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

  if (statuses.includes(overId as TaskStatus)) {
    const newStatus = overId as TaskStatus;

    if (activeTask.status === newStatus) {
      return tasks;
    }

    return tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            status: newStatus,
          }
        : task,
    );
  }

  const overTask = tasks.find((task) => task.id === overId);

  if (!overTask) {
    return tasks;
  }

  if (activeTask.status === overTask.status) {
    const columnTasks = tasks.filter(
      (task) => task.status === activeTask.status,
    );

    const oldIndex = columnTasks.findIndex((task) => task.id === taskId);
    const newIndex = columnTasks.findIndex((task) => task.id === overId);

    const reorderedTasks = [...columnTasks];

    const [movedTask] = reorderedTasks.splice(oldIndex, 1);

    reorderedTasks.splice(newIndex, 0, movedTask);

    const otherTasks = tasks.filter(
      (task) => task.status !== activeTask.status,
    );

    return [...otherTasks, ...reorderedTasks];
  }

  const sourceTasks = tasks.filter(
    (task) => task.status === activeTask.status && task.id !== taskId,
  );

  const targetTasks = tasks.filter((task) => task.status === overTask.status);

  const overIndex = targetTasks.findIndex((task) => task.id === overId);

  const movedTask: Task = {
    ...activeTask,
    status: overTask.status,
  };

  targetTasks.splice(overIndex, 0, movedTask);

  return [
    ...tasks.filter(
      (task) =>
        task.status !== activeTask.status && task.status !== overTask.status,
    ),
    ...sourceTasks,
    ...targetTasks,
  ];
};
