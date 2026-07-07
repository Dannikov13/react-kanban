import type { Task } from '@/entities/task';

interface TaskCardProps {
  task: Task;
}

const TaskCard = ({ task }: TaskCardProps) => {
  const { title, description, status } = task;
  return (
    <div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      <p>Status: {status}</p>
    </div>
  );
};

export default TaskCard;
