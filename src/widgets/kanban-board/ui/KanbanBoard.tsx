import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';
import { useState } from 'react';
import type { Task } from '@/entities/task';
import { initialTasks } from '@/entities/task/model/initialTasks';

const KanbanBoard = () => {
  const [tasks] = useState<Task[]>(initialTasks);

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <section className="grid gap-6 md:grid-cols-3">
      <TaskColumn title="Todo" tasks={todoTasks} />
      <TaskColumn title="In Progress" tasks={inProgressTasks} />
      <TaskColumn title="Done" tasks={doneTasks} />
    </section>
  );
};

export default KanbanBoard;
