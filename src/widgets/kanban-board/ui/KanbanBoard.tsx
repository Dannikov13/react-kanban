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
      status: data.status,
      createdAt: Date.now(),
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (taskId: Task['id']) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this task?',
    );

    if (!isConfirmed) {
      return;
    }
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'progress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <>
      <CreateTaskForm onCreateTask={handleCreateTask} />

      <section className="grid gap-6 md:grid-cols-3">
        <TaskColumn
          title="Todo"
          variant="todo"
          tasks={todoTasks}
          onDeleteTask={handleDeleteTask}
        />

        <TaskColumn
          title="In Progress"
          variant="progress"
          tasks={inProgressTasks}
          onDeleteTask={handleDeleteTask}
        />

        <TaskColumn
          title="Done"
          variant="done"
          tasks={doneTasks}
          onDeleteTask={handleDeleteTask}
        />
      </section>
    </>
  );
};

export default KanbanBoard;
