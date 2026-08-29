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
  insertionTargetId: string | null;
  insertionPosition: 'before' | 'after' | null;
  onDeleteTask: (taskId: Task['id']) => void;
  onUpdateTask: (taskId: Task['id'], updatedData: Partial<Task>) => void;
}

const TaskColumn = ({
  title,
  tasks,
  variant,
  isFiltered,
  insertionTargetId,
  insertionPosition,
  onDeleteTask,
  onUpdateTask,
}: TaskColumnProps) => {
  const { container, badge } = columnStyles[variant];

  const { setNodeRef, isOver } = useDroppable({
    id: variant,
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-w-0 rounded-2xl p-5 transition-all duration-200 ${container} ${
        isOver
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white dark:ring-blue-500 dark:ring-offset-slate-900'
          : ''
      }`}
    >
      <header className="mb-5 flex min-w-0 items-center justify-between gap-3">
        <h2 className="min-w-0 break-words text-xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h2>

        <span
          className={`flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-sm font-semibold ${badge}`}
        >
          {tasks.length}
        </span>
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-w-0 space-y-4">
          {tasks.length === 0 ? (
            <div
              className={`flex min-h-32 min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center transition-colors ${
                isOver
                  ? 'border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/20'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
            >
              <p className="text-2xl">{isFiltered ? '🔎' : '📭'}</p>

              <p className="font-medium text-slate-600 dark:text-slate-300">
                {isFiltered ? 'No matching tasks' : 'No tasks yet'}
              </p>

              <p className="break-words text-sm text-slate-400">
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
                insertionPosition={
                  insertionTargetId === task.id ? insertionPosition : null
                }
              />
            ))
          )}
        </div>
      </SortableContext>
    </section>
  );
};

export default TaskColumn;
