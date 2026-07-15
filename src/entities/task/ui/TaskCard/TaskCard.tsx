import type { Task } from '@/entities/task';

interface TaskCardProps {
  task: Task;
  onMove: (id: string, newStatus: Task['status']) => void;
}

const TaskCard = ({ task, onMove }: TaskCardProps) => {
  const { title, description, status } = task;
  return (
    <div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <p>Status: {status}</p>
      <label htmlFor={`status-${task.id}`}>Change Status:</label>
      <select
        id={`status-${task.id}`}
        value={task.status}
        onChange={(e) => onMove(task.id, e.target.value as Task['status'])}
      >
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
};

export default TaskCard;
