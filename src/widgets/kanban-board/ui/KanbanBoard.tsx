import type { CreateTaskData, Task, TaskStatus } from '@/entities/task';
import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { initialTasks } from '@/entities/task/model/initialTasks';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

type TasksByStatus = {
  todo: Task[];
  'in-progress': Task[];
  done: Task[];
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useLocalStorage('tasks', initialTasks);

  const handleCreateTask = (data: CreateTaskData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      createdAt: Date.now(),
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };
  const handleDeleteTask = (taskId: Task['id']) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );

    if (!isConfirmed) {
      return;
    }
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleUpdateTask = (taskId: Task['id'], updatedData: Partial<Task>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              ...updatedData,
            }
          : task,
      ),
    );
  };

  const handleMoveTask = (taskId: Task['id'], overId: string) => {
    setTasks((prevTasks) => {
      const activeTask = prevTasks.find((task) => task.id === taskId);

      if (!activeTask) {
        return prevTasks;
      }

      const statuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

      // Если бросили непосредственно на колонку
      if (statuses.includes(overId as TaskStatus)) {
        const newStatus = overId as TaskStatus;

        if (activeTask.status === newStatus) {
          return prevTasks;
        }

        return prevTasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                status: newStatus,
              }
            : task,
        );
      }

      // Если бросили на другую карточку
      const overTask = prevTasks.find((task) => task.id === overId);

      if (!overTask) {
        return prevTasks;
      }

      // Перемещение внутри одной колонки
      if (activeTask.status === overTask.status) {
        const columnTasks = prevTasks.filter(
          (task) => task.status === activeTask.status,
        );

        const oldIndex = columnTasks.findIndex((task) => task.id === taskId);
        const newIndex = columnTasks.findIndex((task) => task.id === overId);

        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);

        const otherTasks = prevTasks.filter(
          (task) => task.status !== activeTask.status,
        );

        return [...otherTasks, ...reorderedTasks];
      }

      // Перемещение между колонками
      const sourceTasks = prevTasks.filter(
        (task) => task.status === activeTask.status && task.id !== taskId,
      );

      const targetTasks = prevTasks.filter(
        (task) => task.status === overTask.status,
      );

      const overIndex = targetTasks.findIndex((task) => task.id === overId);

      const movedTask = {
        ...activeTask,
        status: overTask.status,
      };

      targetTasks.splice(overIndex, 0, movedTask);

      return [
        ...prevTasks.filter(
          (task) =>
            task.status !== activeTask.status &&
            task.status !== overTask.status,
        ),
        ...sourceTasks,
        ...targetTasks,
      ];
    });
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.over) {
      return;
    }

    handleMoveTask(String(e.active.id), String(e.over.id));
  };

  const tasksByStatus = tasks.reduce<TasksByStatus>(
    (acc, task) => {
      acc[task.status].push(task);

      return acc;
    },
    {
      todo: [],
      'in-progress': [],
      done: [],
    },
  );

  return (
    <>
      <CreateTaskForm onCreateTask={handleCreateTask} />
      <DndContext onDragEnd={handleDragEnd}>
        <section className="grid gap-6 md:grid-cols-3">
          <TaskColumn
            title="Todo"
            variant="todo"
            tasks={tasksByStatus.todo}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
          <TaskColumn
            title="In Progress"
            variant="in-progress"
            tasks={tasksByStatus['in-progress']}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />

          <TaskColumn
            title="Done"
            variant="done"
            tasks={tasksByStatus.done}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        </section>
      </DndContext>
    </>
  );
};

export default KanbanBoard;
