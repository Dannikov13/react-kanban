import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';
import ConfirmDialog from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { initialTasks } from '@/entities/task/model/initialTasks';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';
import TaskFilter from '@/features/task-filter/ui/TaskFilter';
import type {
  CreateTaskData,
  DueDateFilter,
  Task,
  TaskFilters,
  TaskPriority,
  TaskSort,
  TaskStatus,
} from '@/entities/task';
import {
  createTask,
  deleteTask,
  filterTasks,
  moveTask,
  sortTasks,
  updateTask,
} from '@/entities/task/lib/taskUtils';

type TasksByStatus = {
  todo: Task[];
  'in-progress': Task[];
  done: Task[];
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useLocalStorage('tasks', initialTasks);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>(
    'all',
  );
  const [sort, setSort] = useState<TaskSort>('manual');
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all');
  const [taskIdToDelete, setTaskIdToDelete] = useState<Task['id'] | null>(null);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSort('manual');
    setDueDateFilter('all');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    sort !== 'manual' ||
    dueDateFilter !== 'all';

  const handleCreateTask = (data: CreateTaskData) => {
    const newTask = createTask({
      ...data,
      createdAt: Date.now(),
    });

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: Task['id']) => {
    setTaskIdToDelete(taskId);
  };

  const handleConfirmDelete = () => {
    if (!taskIdToDelete) {
      return;
    }

    setTasks((prevTasks) => deleteTask(prevTasks, taskIdToDelete));
    setTaskIdToDelete(null);
  };

  const handleCancelDelete = () => {
    setTaskIdToDelete(null);
  };

  const handleUpdateTask = (taskId: Task['id'], updatedData: Partial<Task>) => {
    setTasks((prevTasks) => updateTask(prevTasks, taskId, updatedData));
  };

  const handleMoveTask = (taskId: Task['id'], overId: string) => {
    setTasks((prevTasks) => moveTask(prevTasks, taskId, overId));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    if (!e.over) {
      return;
    }

    const activeId = String(e.active.id);
    const overId = String(e.over.id);

    const columnStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

    const isDroppedOnColumn = columnStatuses.includes(overId as TaskStatus);

    if (sort !== 'manual' && !isDroppedOnColumn) {
      return;
    }

    handleMoveTask(activeId, overId);
  };

  const filters: TaskFilters = {
    search,
    status: statusFilter,
    priority: priorityFilter,
    dueDate: dueDateFilter,
  };

  const filteredTasks = filterTasks(tasks, filters);
  const sortedTasks = sortTasks(filteredTasks, sort);

  const tasksByStatus = sortedTasks.reduce<TasksByStatus>(
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

      <TaskFilter
        search={search}
        status={statusFilter}
        priority={priorityFilter}
        sort={sort}
        dueDate={dueDateFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSortChange={setSort}
        onDueDateChange={setDueDateFilter}
      />

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}{' '}
          found
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        )}
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <section className="grid gap-6 md:grid-cols-3">
          <TaskColumn
            title="Todo"
            variant="todo"
            tasks={tasksByStatus.todo}
            isFiltered={hasActiveFilters}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />

          <TaskColumn
            title="In Progress"
            variant="in-progress"
            tasks={tasksByStatus['in-progress']}
            isFiltered={hasActiveFilters}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />

          <TaskColumn
            title="Done"
            variant="done"
            tasks={tasksByStatus.done}
            isFiltered={hasActiveFilters}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        </section>
      </DndContext>
      <ConfirmDialog
        isOpen={taskIdToDelete !== null}
        title="Delete task?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default KanbanBoard;
