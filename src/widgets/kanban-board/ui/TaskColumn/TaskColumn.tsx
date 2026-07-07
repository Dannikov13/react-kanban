import TaskCard from '@/entities/task/ui/TaskCard';
import type { Task } from '@/entities/task';
import styles from './TaskColumn.module.css';

interface TaskColumnProps {
  // id: string;
  title: string;
  tasks: Task[];
}

const TaskColumn = ({ title, tasks }: TaskColumnProps) => {
  return (
    <section className={styles.column}>
      <h2>{title}</h2>
      <div className={styles.tasks}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
};

export default TaskColumn;
