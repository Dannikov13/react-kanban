import TaskColumn from '@/widgets/kanban-board/ui/TaskColumn';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const todoTasks = tasks.filter((task) => task.status === 'todo');
  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress');
  const doneTasks = tasks.filter((task) => task.status === 'done');

  return (
    <>
      <TaskColumn
        title="Todo"
        tasks={todoTasks}
      />
      <TaskColumn
        title="In Progress"
        tasks={inProgressTasks}
      />
      <TaskColumn
        title="Done"
        tasks={doneTasks}
      />
    </>
  );
};

export default KanbanBoard;
