import { useState } from 'react';
import type { Task, TaskStatus } from '@/entities/task';
import { useSortable } from '@dnd-kit/sortable';
import { formatDueDate } from '@/entities/task/lib/taskDateUtils';
import DateTimePicker from '@/shared/ui/DateTimePicker/DateTimePicker';
import {
  type DueDateStatus,
  getDueDateStatus,
} from '@/entities/task/lib/dueDateUtils.ts';

interface TaskCardProps {
  task: Task;
  onDeleteTask: (taskId: Task['id']) => void;
  onUpdateTask: (taskId: Task['id'], updatedData: Partial<Task>) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const dueDateStyles: Record<DueDateStatus, string> = {
  none: '',
  overdue: 'text-red-600',
  today: 'text-amber-600',
  tomorrow: 'text-blue-600',
  upcoming: 'text-slate-500',
};

const dueDateLabels: Record<DueDateStatus, string> = {
  none: '',
  overdue: 'Overdue',
  today: 'Today',
  tomorrow: 'Tomorrow',
  upcoming: 'Due',
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

  const dueDateStatus = getDueDateStatus(task.dueDate);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    priority: task.priority,
    status: task.status,
  });

  const isTitleInvalid = formData.title.trim().length < 3;

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const handleSave = () => {
    if (isTitleInvalid) {
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
        className={`group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
          isDragging ? 'border-blue-400 opacity-60 shadow-lg' : ''
        }`}
      >
        <div className="mb-3 flex items-center justify-end">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab rounded px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
            aria-label="Drag task"
            disabled={isDragging}
          >
            ⋮⋮
          </button>
        </div>

        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label className="text-sm font-medium text-slate-700">Title:</label>

          <input
            className={`rounded-lg border px-3 py-2 ${
              isTitleInvalid
                ? 'border-red-400 focus:border-red-500'
                : 'border-slate-300'
            }`}
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
          />

          {isTitleInvalid && (
            <p className="text-sm text-red-500">
              Title must contain at least 3 characters.
            </p>
          )}

          <label className="text-sm font-medium text-slate-700">
            Description:
          </label>

          <textarea
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
          />

          <label className="text-sm font-medium text-slate-700">
            Due date:
          </label>

          <DateTimePicker
            value={formData.dueDate}
            onChange={(value) =>
              setFormData({
                ...formData,
                dueDate: value,
              })
            }
          />

          <label className="text-sm font-medium text-slate-700">
            Priority:
          </label>

          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as Task['priority'],
              })
            }
            disabled={isDragging}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label className="text-sm font-medium text-slate-700">Status:</label>

          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as TaskStatus,
              })
            }
            disabled={isDragging}
          >
            <option value="todo">Todo</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isTitleInvalid}
              className="rounded-lg bg-blue-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border px-4 py-2"
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
      className={`relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
        isDragging ? 'border-blue-400 opacity-60 shadow-lg' : ''
      }`}
    >
      {isOver && !isDragging && (
        <div className="absolute -top-2 left-0 right-0 h-1 rounded-full bg-blue-500" />
      )}

      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="font-medium text-slate-900">{task.title}</h3>

        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 cursor-grab touch-none rounded px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          aria-label="Drag task"
          disabled={isDragging}
        >
          ⋮⋮
        </button>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-slate-600">{task.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

        {task.dueDate !== undefined && (
          <div className="mt-3">
            <p
              className={`text-sm font-medium ${dueDateStyles[dueDateStatus]}`}
            >
              {dueDateLabels[dueDateStatus]}: {formatDueDate(task.dueDate)}
            </p>
          </div>
        )}

        <span className="text-xs text-slate-500">{task.status}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="rounded-lg bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
        >
          Delete
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white hover:bg-yellow-600"
        >
          Edit
        </button>
      </div>
    </article>
  );
};

export default TaskCard;
