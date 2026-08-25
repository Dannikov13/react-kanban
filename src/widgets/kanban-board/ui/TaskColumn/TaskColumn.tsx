import TaskCard from '@/entities/task/ui/TaskCard/TaskCard';
import type { Task, TaskStatus } from '@/entities/task';
import { columnStyles } from '@/widgets/kanban-board/model/columnStyles';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  variant: TaskStatus;
  isFiltered: boolean;
  onDeleteTask: (taskId: Task['id']) => void;
  onUpdateTask: (taskId: Task['id'], updatedData: Partial<Task>) => void;
}

const TaskColumn = ({
  title,
  tasks,
  variant,
  isFiltered,
  onDeleteTask,
  onUpdateTask,
}: TaskColumnProps) => {
  const { container, badge } = columnStyles[variant];

  const { setNodeRef } = useDroppable({
    id: variant,
  });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-2xl p-5 transition-colors ${container}`}
    >
      <header className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>

        <span
          className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-sm font-semibold ${badge}`}
        >
          {tasks.length}
        </span>
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-600">
              <p className="text-2xl">{isFiltered ? '🔎' : '📭'}</p>

              <p className="font-medium text-slate-600 dark:text-slate-300">
                {isFiltered ? 'No matching tasks' : 'No tasks yet'}
              </p>

              <p className="text-sm text-slate-400">
                {isFiltered
                  ? 'Try changing your filters.'
                  : 'Create your first task.'}
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
      </SortableContext>
    </section>
  );
};

export default TaskColumn;
