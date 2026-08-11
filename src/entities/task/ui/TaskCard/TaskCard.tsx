import { useState } from 'react';
import type { Task, TaskStatus } from '@/entities/task';
import { useSortable } from '@dnd-kit/sortable';

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
      priority: task.priority,
      status: task.status,
    });

    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <article
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={style}
        className={`relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
          isDragging ? 'scale-105 border-blue-400 opacity-70 shadow-2xl' : ''
        }`}
      >
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
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
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
      {...attributes}
      {...listeners}
      style={style}
      className={`relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md ${
        isDragging ? 'scale-105 border-blue-400 opacity-70 shadow-2xl' : ''
      }`}
    >
      {isOver && !isDragging && (
        <div className="absolute -top-2 left-0 right-0 h-1 rounded-full bg-blue-500" />
      )}

      {task.title}

      {task.description && (
        <p className="mt-2 text-sm text-slate-600">{task.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${priorityColors[task.priority]}`}
        >
          {task.priority}
        </span>

        <span className="text-xs text-slate-500">{task.status}</span>
      </div>

      <button
        onClick={() => onDeleteTask(task.id)}
        className="mt-4 rounded-lg bg-red-500 px-3 py-1 text-sm text-white"
        disabled={isDragging}
      >
        Delete
      </button>

      <button
        onClick={() => setIsEditing(true)}
        className="mt-4 ml-2 rounded-lg bg-yellow-500 px-3 py-1 text-sm text-white"
        disabled={isDragging}
      >
        Edit
      </button>
    </article>
  );
};

export default TaskCard;
