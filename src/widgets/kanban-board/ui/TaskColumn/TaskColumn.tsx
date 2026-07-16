import TaskCard from '@/entities/task/ui/TaskCard/TaskCard';
import type { Task } from '@/entities/task';
import type { ColumnVariant } from '../model/types';
import { columnStyles } from '../model/columnStyles';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  variant: ColumnVariant;
}

const TaskColumn = ({ title, tasks, variant }: TaskColumnProps) => {
  const { container, badge } = columnStyles[variant];

  return (
    <section className={`rounded-2xl ${container} p-5`}>
      <header className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">{title}</h2>

        <span
          className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold ${badge}`}
        >
          {tasks.length}
        </span>
      </header>

      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
};

export default TaskColumn;
