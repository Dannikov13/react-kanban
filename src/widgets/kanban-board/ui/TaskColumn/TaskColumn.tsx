import TaskCard from '@/entities/task/ui/TaskCard/TaskCard';
import type { Task } from '@/entities/task';
import type { ColumnVariant } from '@/widgets/kanban-board/model/types';
import { columnStyles } from '@/widgets/kanban-board/model/columnStyles';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  variant: ColumnVariant;
  onDeleteTask: (taskId: Task['id']) => void;
  onUpdateTask: (taskId: Task['id'], updatedData: Partial<Task>) => void;
}

const TaskColumn = ({
  title,
  tasks,
  variant,
  onDeleteTask,
  onUpdateTask,
}: TaskColumnProps) => {
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
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-lg">📭</p>
            <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
              📭 No tasks yet
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Create your first task.
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDeleteTask={onDeleteTask}
              onUpdateTask={onUpdateTask}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default TaskColumn;
