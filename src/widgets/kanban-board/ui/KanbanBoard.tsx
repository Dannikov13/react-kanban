import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskFilter from '@/features/task-filter/ui/TaskFilter';
import ConfirmDialog from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
} from '@dnd-kit/core';

import { useEffect, useState } from 'react';

import type {
  CreateTaskData,
  DueDateFilter,
  Task,
  TaskFilters,
  TaskSort,
  TaskStatus,
} from '@/entities/task';

import {
  filterTasks,
  moveTask,
  sortTasks,
} from '@/entities/task/lib/taskUtils';

import { TaskCardDragOverlay } from '@/entities/task/ui/TaskCard/TaskCard';

import {
  createTask,
  deleteTask as deleteTaskApi,
  getTasks,
  updateTask as updateTaskApi,
  updateTaskPositions,
} from '@/shared/api/taskApi.ts';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    priority: 'all',
    dueDate: 'all',
  });
  const [sort, setSort] = useState<TaskSort>('manual');
  const [activeTaskId, setActiveTaskId] = useState<Task['id'] | null>(null);
  const [overTaskId, setOverTaskId] = useState<Task['id'] | null>(null);
  const [insertionPosition, setInsertionPosition] = useState<
    'before' | 'after' | null
  >(null);
  const [taskIdToDelete, setTaskIdToDelete] = useState<Task['id'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const tasks = await getTasks();

        setTasks(tasks);
      } catch {
        setError('Failed to load tasks.');
      }
    };

    loadTasks();
  }, []);

  const handleCreateTask = async (data: CreateTaskData) => {
    const newTask = await createTask(data);

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: Task['id']) => {
    setTaskIdToDelete(taskId);
  };

  const handleConfirmDelete = async () => {
    if (!taskIdToDelete) {
      return;
    }

    await deleteTaskApi(taskIdToDelete);

    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskIdToDelete),
    );

    setTaskIdToDelete(null);
  };

  const handleCancelDelete = () => {
    setTaskIdToDelete(null);
  };

  const handleUpdateTask = async (
    taskId: Task['id'],
    updatedData: Partial<Task>,
  ) => {
    const updatedTask = await updateTaskApi(taskId, updatedData);

    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    setActiveTaskId(active.id as Task['id']);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setOverTaskId(null);
      setInsertionPosition(null);
      return;
    }

    const activeId = active.id as Task['id'];
    const overId = over.id as Task['id'];

    setOverTaskId(overId);

    if (activeId === overId) {
      setInsertionPosition(null);
      return;
    }

    const activeTask = tasks.find((task) => task.id === activeId);
    const overTask = tasks.find((task) => task.id === overId);

    if (!activeTask || !overTask) {
      setInsertionPosition(null);
      return;
    }

    const activeRect = active.rect.current.translated;

    if (!activeRect) {
      setInsertionPosition(null);
      return;
    }

    const overRect = over.rect;

    const activeCenterY = activeRect.top + activeRect.height / 2;
    const overCenterY = overRect.top + overRect.height / 2;

    setInsertionPosition(activeCenterY < overCenterY ? 'before' : 'after');
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTaskId(null);
    setOverTaskId(null);
    setInsertionPosition(null);

    if (!over) {
      return;
    }

    const activeId = active.id as Task['id'];
    const overId = over.id as Task['id'];

    if (activeId === overId) {
      return;
    }

    const newTasks = moveTask(tasks, activeId, overId);

    const positionsByStatus: Record<TaskStatus, number> = {
      todo: 0,
      'in-progress': 0,
      done: 0,
    };

    const updatedTasks = newTasks.map((task) => {
      const position = positionsByStatus[task.status];

      positionsByStatus[task.status] += 1;

      return {
        ...task,
        position,
      };
    });

    setTasks(updatedTasks);

    await updateTaskPositions(
      updatedTasks.map(({ id, status, position }) => ({
        id,
        status,
        position,
      })),
    );
  };

  const filteredTasks = filterTasks(tasks, filters);

  const sortedTasks = sortTasks(filteredTasks, sort);

  const todoTasks = sortedTasks.filter((task) => task.status === 'todo');

  const inProgressTasks = sortedTasks.filter(
    (task) => task.status === 'in-progress',
  );

  const doneTasks = sortedTasks.filter((task) => task.status === 'done');

  const activeTask = activeTaskId
    ? tasks.find((task) => task.id === activeTaskId)
    : null;

  const isFiltered =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.dueDate !== 'all';

  return (
    <>
      <div className="flex flex-col gap-6">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          >
            {error}
          </div>
        )}

        <CreateTaskForm onCreateTask={handleCreateTask} />

        <TaskFilter
          search={filters.search}
          status={filters.status}
          priority={filters.priority}
          sort={sort}
          dueDate={filters.dueDate}
          onSearchChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              search: value,
            }))
          }
          onStatusChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value,
            }))
          }
          onPriorityChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              priority: value,
            }))
          }
          onSortChange={setSort}
          onDueDateChange={(value: DueDateFilter) =>
            setFilters((prev) => ({
              ...prev,
              dueDate: value,
            }))
          }
        />

        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TaskColumn
              title="Todo"
              tasks={todoTasks}
              variant="todo"
              isFiltered={isFiltered}
              insertionTargetId={overTaskId}
              insertionPosition={insertionPosition}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />

            <TaskColumn
              title="In Progress"
              tasks={inProgressTasks}
              variant="in-progress"
              isFiltered={isFiltered}
              insertionTargetId={overTaskId}
              insertionPosition={insertionPosition}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />

            <TaskColumn
              title="Done"
              tasks={doneTasks}
              variant="done"
              isFiltered={isFiltered}
              insertionTargetId={overTaskId}
              insertionPosition={insertionPosition}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          </div>

          <DragOverlay>
            {activeTask ? <TaskCardDragOverlay task={activeTask} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <ConfirmDialog
        isOpen={taskIdToDelete !== null}
        title="Delete task?"
        description="Are you sure you want to delete this task?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default KanbanBoard;
