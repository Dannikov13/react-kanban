import TaskCard from '@/entities/task/ui/TaskCard/TaskCard';
import type { Task } from '@/entities/task';

interface TaskColumnProps {
  title: string;
  MoveTask: (id: string, newStatus: Task['status']) => void;
  tasks: Task[];
}

const TaskColumn = ({ title, MoveTask, tasks }: TaskColumnProps) => {
  return (
    <section className="min-h-96  rounded-xl bg-slate-100 p-4">
      <header className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

        <span
          className="
    rounded-full
    bg-slate-200
    px-2.5
    py-1
    text-xs
    font-medium
    text-slate-700
  "
        >
          {tasks.length}
        </span>
      </header>

      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} moveTask={MoveTask} />
        ))}
      </div>
    </section>
  );
};

export default TaskColumn;
