import { useState } from 'react';
import type { CreateTaskData, Task } from '@/entities/task';
import { initialTasks } from '@/entities/task';
import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleCreateTask = (data: CreateTaskData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: 'todo',
      createdAt: Date.now(),
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <>
      <CreateTaskForm onCreateTask={handleCreateTask} />

      <section className="grid gap-6 md:grid-cols-3">
        <TaskColumn title="Todo" tasks={todoTasks} />

        <TaskColumn title="In Progress" tasks={inProgressTasks} />

        <TaskColumn title="Done" tasks={doneTasks} />
      </section>
    </>
  );
};

export default KanbanBoard;
