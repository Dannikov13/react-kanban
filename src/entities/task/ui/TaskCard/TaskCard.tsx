import { useState } from 'react';
import type { Task, TaskStatus } from '@/entities/task';
import { useSortable } from '@dnd-kit/sortable';
import { formatDueDate } from '@/entities/task/lib/taskDateUtils';
import DateTimePicker from '@/shared/ui/DateTimePicker/DateTimePicker';
import {
  type DueDateStatus,
  getDueDateStatus,
} from '@/entities/task/lib/dueDateUtils';

interface TaskCardProps {
  task: Task;
  onDeleteTask: (taskId: Task['id']) => void;
  onUpdateTask: (taskId: Task['id'], updatedData: Partial<Task>) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  medium:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const dueDateStyles: Record<DueDateStatus, string> = {
  none: '',
  overdue: 'text-red-600 dark:text-red-400',
  today: 'text-amber-600 dark:text-amber-400',
  tomorrow: 'text-blue-600 dark:text-blue-400',
  upcoming: 'text-slate-500 dark:text-slate-400',
};

const dueDateLabels: Record<DueDateStatus, string> = {
  none: '',
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  upcoming: 'Due',
};

const TaskCardDragOverlay = ({ task }: { task: Task }) => {
  const dueDateStatus = getDueDateStatus(task.dueDate);

  return (
    <article className="w-full max-w-md min-w-0 rotate-1 overflow-hidden rounded-xl border border-blue-400 bg-white p-4 shadow-2xl dark:border-blue-500 dark:bg-slate-800">
      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 max-w-full break-words font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
          {task.title}
        </h3>

        <span
          className="shrink-0 rounded px-2 py-1 text-slate-400"
          aria-hidden="true"
        >
          ⋮⋮
        </span>
      </div>

      {task.description && (
        <p className="mt-2 min-w-0 max-w-full break-words text-sm text-slate-600 dark:text-slate-300 [overflow-wrap:anywhere]">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

        {task.dueDate !== undefined && (
          <div className="min-w-0">
            <p
              className={`break-words text-sm font-medium ${dueDateStyles[dueDateStatus]}`}
            >
              {dueDateLabels[dueDateStatus]}: {formatDueDate(task.dueDate)}
            </p>
          </div>
        )}

        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex gap-2">
        <span className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white opacity-70">
          Delete
        </span>

        <span className="rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white opacity-70">
          Edit
        </span>
      </div>
    </article>
  );
};

const TaskCard = ({ task, onDeleteTask, onUpdateTask }: TaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: task.id,
  });

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
  });

  const isTitleEmpty = formData.title.trim().length === 0;

  const dueDateStatus = getDueDateStatus(task.dueDate);

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const handleSave = () => {
    if (isTitleEmpty) {
      return;
    }

    onUpdateTask(task.id, {
      ...formData,
      title: formData.title.trim(),
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
    });

    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <article
        ref={setNodeRef}
        style={style}
        className={`group relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800 ${
          isDragging ? 'border-blue-400 opacity-30 shadow-lg' : ''
        }`}
      >
        <div className="mb-5 flex min-w-0 items-center justify-between gap-3">
          <h3 className="min-w-0 break-words text-lg font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
            Edit task
          </h3>

          <button
            type="button"
            {...attributes}
            {...listeners}
            className="shrink-0 cursor-grab rounded-lg px-2 py-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing dark:hover:bg-slate-700 dark:hover:text-slate-200"
            aria-label="Drag task"
            disabled={isDragging}
          >
            ⋮⋮
          </button>
        </div>

        <form
          className="min-w-0 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="flex min-w-0 flex-col gap-2">
            <label
              htmlFor={`edit-title-${task.id}`}
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Title
            </label>

            <input
              id={`edit-title-${task.id}`}
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
              className={`w-full min-w-0 max-w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition-all dark:bg-slate-900 dark:text-slate-200 ${
                isTitleEmpty
                  ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-900/40'
                  : 'border-slate-300 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:hover:border-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40'
              }`}
            />

            {isTitleEmpty && (
              <p className="text-sm text-red-500 dark:text-red-400">
                Title is required.
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label
              htmlFor={`edit-description-${task.id}`}
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>

            <textarea
              id={`edit-description-${task.id}`}
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="min-h-24 w-full min-w-0 max-w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            />
          </div>

          <DateTimePicker
            value={formData.dueDate}
            onChange={(value) =>
              setFormData({
                ...formData,
                dueDate: value,
              })
            }
          />

          <div className="flex min-w-0 flex-col gap-2">
            <label
              htmlFor={`edit-priority-${task.id}`}
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Priority
            </label>

            <select
              id={`edit-priority-${task.id}`}
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as Task['priority'],
                })
              }
              disabled={isDragging}
              className="w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <label
              htmlFor={`edit-status-${task.id}`}
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Status
            </label>

            <select
              id={`edit-status-${task.id}`}
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as TaskStatus,
                })
              }
              disabled={isDragging}
              className="w-full min-w-0 max-w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition-all hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
            >
              <option value="todo">Todo</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-700">
            <button
              type="submit"
              disabled={isTitleEmpty}
              className="max-w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:hover:bg-blue-500"
            >
              Save changes
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="max-w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`relative min-w-0 max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-700 dark:bg-slate-800 ${
        isDragging ? 'border-blue-400 opacity-30 shadow-lg' : ''
      }`}
    >
      {isOver && !isDragging && (
        <div className="absolute -top-2 left-0 right-0 h-1 rounded-full bg-blue-500" />
      )}

      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
        <h3 className="min-w-0 max-w-full break-words font-medium text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">
          {task.title}
        </h3>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none rounded px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing dark:hover:bg-slate-700 dark:hover:text-slate-200"
          aria-label="Drag task"
          disabled={isDragging}
        >
          ⋮⋮
        </button>
      </div>

      {task.description && (
        <p className="mt-2 min-w-0 max-w-full break-words text-sm text-slate-600 dark:text-slate-300 [overflow-wrap:anywhere]">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex min-w-0 items-center justify-between gap-3">
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

        {task.dueDate !== undefined && (
          <div className="min-w-0">
            <p
              className={`break-words text-sm font-medium ${dueDateStyles[dueDateStatus]}`}
            >
              {dueDateLabels[dueDateStatus]}: {formatDueDate(task.dueDate)}
            </p>
          </div>
        )}

        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          {task.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white transition hover:bg-red-600"
        >
          Delete
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white transition hover:bg-yellow-600"
        >
          Edit
        </button>
      </div>
    </article>
  );
};

export { TaskCardDragOverlay };
export default TaskCard;
