import type { Task } from '@/entities/task';

interface TaskCardProps {
  task: Task;
  onDeleteTask: (taskId: Task['id']) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const TaskCard = ({ task, onDeleteTask }: TaskCardProps) => {
  console.log('TaskCard props:', {
    task,
    onDeleteTask,
  });

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
    </article>
  );
};

export default TaskCard;
