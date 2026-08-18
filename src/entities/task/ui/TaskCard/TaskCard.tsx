import { useState } from 'react';
import type { Task, TaskStatus } from '@/entities/task';
import { useSortable } from '@dnd-kit/sortable';
import {
  formatDateTimeLocal,
  formatDueDate,
  parseDateTimeLocal,
} from '@/entities/task/lib/taskDateUtils';

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

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  const handleSave = () => {
    onUpdateTask(task.id, formData);
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
            className="cursor-grab  rounded px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
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
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={formData.title}
            onChange={(e) => {
              setFormData({
                ...formData,
                dueDate: parseDateTimeLocal(e.target.value),
              });
            }}
          />

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

          <input
            type="datetime-local"
            value={formatDateTimeLocal(formData.dueDate)}
            onChange={(e) => {
              if (!e.target.value) {
                setFormData({
                  ...formData,
                  dueDate: undefined,
                });

                return;
              }

              const dateTime = Temporal.PlainDateTime.from(e.target.value);

              const timestamp =
                dateTime.toZonedDateTime('Europe/Kyiv').epochMilliseconds;

              setFormData({
                ...formData,
                dueDate: timestamp,
              });
            }}
            className="rounded-lg border border-slate-300 px-3 py-2"
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
              className="rounded-lg bg-blue-500 px-4 py-2 text-white"
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

      {task.dueDate !== undefined && (
        <p className="mt-3 text-sm text-slate-500">
          Due: {formatDueDate(task.dueDate)}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

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
