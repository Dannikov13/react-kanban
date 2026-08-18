import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { initialTasks } from '@/entities/task/model/initialTasks';
import type { DragEndEvent } from '@dnd-kit/core';
import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';
import TaskFilter from '@/features/task-filter/ui/TaskFilter';
import type {
  CreateTaskData,
  Task,
  TaskPriority,
  TaskSort,
  TaskStatus,
} from '@/entities/task';
import {
  createTask,
  deleteTask,
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
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>(
    'all',
  );
  const [sort, setSort] = useState<TaskSort>('manual');

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSort('manual');
  };

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'all' || priorityFilter !== 'all';

  const handleCreateTask = (data: CreateTaskData) => {
    const newTask = createTask({
      ...data,
      createdAt: Date.now(),
    });

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: Task['id']) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );

    if (!isConfirmed) {
      return;
    }

    setTasks((prevTasks) => deleteTask(prevTasks, taskId));
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

    handleMoveTask(String(e.active.id), String(e.over.id));
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description ?? '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'all' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
        onSortChange={setSort}
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
