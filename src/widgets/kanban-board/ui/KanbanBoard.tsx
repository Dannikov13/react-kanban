import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';
import ConfirmDialog from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { initialTasks } from '@/entities/task/model/initialTasks';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
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
import { TaskCardDragOverlay } from '@/entities/task/ui/TaskCard/TaskCard';

type TasksByStatus = {
  todo: Task[];
  'in-progress': Task[];
  done: Task[];
};

type InsertionPosition = 'before' | 'after' | null;

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
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [insertionTargetId, setInsertionTargetId] = useState<string | null>(
    null,
  );

  const [insertionPosition, setInsertionPosition] =
    useState<InsertionPosition>(null);

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

  const handleDragStart = (e: DragStartEvent) => {
    const task = tasks.find((item) => item.id === String(e.active.id));

    setActiveTask(task ?? null);
    setInsertionTargetId(null);
    setInsertionPosition(null);
  };

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;

    if (!over) {
      setInsertionTargetId(null);
      setInsertionPosition(null);
      return;
    }

    const overId = String(over.id);
    const activeId = String(active.id);

    // Don't show an insertion indicator on the dragged card itself.
    if (overId === activeId) {
      setInsertionTargetId(null);
      setInsertionPosition(null);
      return;
    }

    const columnStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

    // Dropping directly on an empty/whole column doesn't have
    // a before/after position.
    if (columnStatuses.includes(overId as TaskStatus)) {
      setInsertionTargetId(null);
      setInsertionPosition(null);
      return;
    }

    const overTask = tasks.find((task) => task.id === overId);

    if (!overTask) {
      setInsertionTargetId(null);
      setInsertionPosition(null);
      return;
    }

    const activeRect = active.rect.current.translated;
    const overRect = over.rect;

    if (!activeRect) {
      setInsertionTargetId(overId);
      setInsertionPosition('before');
      return;
    }

    const activeCenterY = activeRect.top + activeRect.height / 2;
    const overCenterY = overRect.top + overRect.height / 2;

    const position: InsertionPosition =
      activeCenterY < overCenterY ? 'before' : 'after';

    setInsertionTargetId(overId);
    setInsertionPosition(position);
  };

  const clearInsertionIndicator = () => {
    setInsertionTargetId(null);
    setInsertionPosition(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const over = e.over;

    setActiveTask(null);

    if (!over) {
      clearInsertionIndicator();
      return;
    }

    const activeId = String(e.active.id);
    const overId = String(over.id);

    const columnStatuses: TaskStatus[] = ['todo', 'in-progress', 'done'];

    const isDroppedOnColumn = columnStatuses.includes(overId as TaskStatus);

    if (sort !== 'manual' && !isDroppedOnColumn) {
      clearInsertionIndicator();
      return;
    }

    handleMoveTask(activeId, overId);
    clearInsertionIndicator();
  };

  const handleDragCancel = () => {
    setActiveTask(null);
    clearInsertionIndicator();
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

      <div className="mb-6 flex min-w-0 items-center justify-between gap-4">
        <p className="min-w-0 text-sm text-slate-500">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}{' '}
          found
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            Clear filters
          </button>
        )}
      </div>

      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <section className="grid min-w-0 gap-6 md:grid-cols-3">
          <TaskColumn
            title="Todo"
            variant="todo"
            tasks={tasksByStatus.todo}
            isFiltered={hasActiveFilters}
            insertionTargetId={insertionTargetId}
            insertionPosition={insertionPosition}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />

          <TaskColumn
            title="In Progress"
            variant="in-progress"
            tasks={tasksByStatus['in-progress']}
            isFiltered={hasActiveFilters}
            insertionTargetId={insertionTargetId}
            insertionPosition={insertionPosition}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />

          <TaskColumn
            title="Done"
            variant="done"
            tasks={tasksByStatus.done}
            isFiltered={hasActiveFilters}
            insertionTargetId={insertionTargetId}
            insertionPosition={insertionPosition}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        </section>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCardDragOverlay task={activeTask} /> : null}
        </DragOverlay>
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
