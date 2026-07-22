import { useState } from 'react';
import type { Task, TaskStatus } from '@/entities/task';

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
  const initialFormData = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
  };
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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
      <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label className="text-sm font-medium text-slate-700" htmlFor="title">
            Title:
          </label>
          <input
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({
                ...formData,
                title: e.target.value,
              })
            }
            maxLength={100}
          />

          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="description"
          >
            Description:
          </label>
          <textarea
            className="min-h-24 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            maxLength={500}
          />

          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="priority"
          >
            Priority:
          </label>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            id="priority"
            value={formData.priority}
            onChange={(e) =>
              setFormData({
                ...formData,
                priority: e.target.value as Task['priority'],
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="status"
          >
            Status:
          </label>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            id="status"
            value={formData.status}
            onChange={(e) =>
              setFormData({
                ...formData,
                status: e.target.value as TaskStatus,
              })
            }
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition"
              type="submit"
            >
              Save
            </button>

            <button
              className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-100 transition"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>

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
        className="mt-4 rounded-lg bg-red-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600"
      >
        Delete
      </button>
      <button
        className="mt-4 rounded-lg bg-yellow-500 px-3 py-1 text-sm font-medium text-white transition hover:bg-yellow-600"
        onClick={() => setIsEditing(true)}
      >
        Edit
      </button>
    </article>
  );
};

export default TaskCard;
