import { useState } from 'react';
import type { CreateTaskData, Task } from '@/entities/task';
import { initialTasks } from '@/entities/task';
import CreateTaskForm from '@/features/create-task/ui/CreateTaskForm';
import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const moveTask = (id: Task['id'], newStatus: Task['status']) => {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: newStatus,
            }
          : task,
      ),
    );
  };

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

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <>
      <CreateTaskForm onCreateTask={handleCreateTask} />

      <section className="grid gap-6 md:grid-cols-3">
        <TaskColumn
          title="Todo"
          variant="todo"
          tasks={todoTasks}
          onMove={moveTask}
        />

        <TaskColumn
          title="In Progress"
          variant="in-progress"
          tasks={inProgressTasks}
          onMove={moveTask}
        />

        <TaskColumn
          title="Done"
          variant="done"
          tasks={doneTasks}
          onMove={moveTask}
        />
      </section>
    </>
  );
};

export default KanbanBoard;
