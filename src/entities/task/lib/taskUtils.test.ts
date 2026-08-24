import { describe, expect, it } from 'vitest';
import type { DueDateFilter, Task } from '@/entities/task';
import {
  createTask,
  deleteTask,
  filterTasks,
  moveTask,
  sortTasks,
  updateTask,
} from '@/entities/task/lib/taskUtils.ts';

const tasks: Task[] = [
  {
    id: '1',
    title: 'First task',
    description: 'First description',
    priority: 'low',
    status: 'todo',
  },
  {
    id: '2',
    title: 'Second task',
    description: 'Second description',
    priority: 'medium',
    status: 'in-progress',
  },
];

describe('createTask', () => {
  it('creates a task with generated id', () => {
    const data = {
      title: 'New task',
      description: 'New description',
      dueDate: 1786795200000,
      priority: 'high' as const,
      status: 'todo' as const,
      createdAt: 1786795200000,
    };

    const result = createTask(data);

    expect(result).toEqual({
      ...data,
      id: expect.any(String),
    });
  });

  it('generates a unique id for each task', () => {
    const data = {
      title: 'New task',
      priority: 'medium' as const,
      status: 'todo' as const,
    };

    const firstTask = createTask(data);
    const secondTask = createTask(data);

    expect(firstTask.id).not.toBe(secondTask.id);
  });
});

describe('deleteTask', () => {
  it('deletes task by id', () => {
    const result = deleteTask(tasks, '1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns the same tasks when id does not exist', () => {
    const result = deleteTask(tasks, '999');

    expect(result).toEqual(tasks);
  });
});

describe('updateTask', () => {
  it('updates task by id', () => {
    const result = updateTask(tasks, '1', {
      title: 'Updated task',
      priority: 'high',
    });

    expect(result[0]).toEqual({
      id: '1',
      title: 'Updated task',
      description: 'First description',
      priority: 'high',
      status: 'todo',
    });
  });

  it('does not change other tasks', () => {
    const result = updateTask(tasks, '1', {
      title: 'Updated task',
    });

    expect(result[1]).toEqual(tasks[1]);
  });
});

describe('moveTask', () => {
  it('moves task to another column', () => {
    const result = moveTask(tasks, '1', 'done');

    expect(result.find((task) => task.id === '1')?.status).toBe('done');
  });

  it('reorders tasks inside the same column', () => {
    const tasksForReorder: Task[] = [
      {
        id: '1',
        title: 'First task',
        priority: 'low',
        status: 'todo',
      },
      {
        id: '2',
        title: 'Second task',
        priority: 'medium',
        status: 'todo',
      },
      {
        id: '3',
        title: 'Third task',
        priority: 'high',
        status: 'todo',
      },
    ];

    const result = moveTask(tasksForReorder, '1', '3');

    const todoTasks = result.filter((task) => task.status === 'todo');

    expect(todoTasks.map((task) => task.id)).toEqual(['2', '3', '1']);
  });

  it('moves task between columns and inserts it before the target task', () => {
    const tasksForMoving: Task[] = [
      {
        id: '1',
        title: 'Todo task',
        priority: 'low',
        status: 'todo',
      },
      {
        id: '2',
        title: 'In progress task',
        priority: 'medium',
        status: 'in-progress',
      },
      {
        id: '3',
        title: 'Another in progress task',
        priority: 'high',
        status: 'in-progress',
      },
    ];

    const result = moveTask(tasksForMoving, '1', '3');

    const inProgressTasks = result.filter(
      (task) => task.status === 'in-progress',
    );

    expect(inProgressTasks.map((task) => task.id)).toEqual(['2', '1', '3']);
    expect(result.find((task) => task.id === '1')?.status).toBe('in-progress');
  });

  it('returns the same tasks when task does not exist', () => {
    const result = moveTask(tasks, '999', 'done');

    expect(result).toEqual(tasks);
  });
});

describe('filterTasks', () => {
  const today = Temporal.Now.plainDateISO('Europe/Kyiv');

  const yesterday = today.subtract({ days: 1 });
  const tomorrow = today.add({ days: 1 });
  const upcoming = today.add({ days: 5 });

  const toTimestamp = (date: Temporal.PlainDate) =>
    Temporal.ZonedDateTime.from({
      timeZone: 'Europe/Kyiv',
      year: date.year,
      month: date.month,
      day: date.day,
      hour: 12,
      minute: 0,
    }).epochMilliseconds;

  const tasksForFiltering: Task[] = [
    {
      id: '1',
      title: 'Learn React',
      description: 'Study React hooks',
      priority: 'high',
      status: 'todo',
      dueDate: toTimestamp(today),
    },
    {
      id: '2',
      title: 'Build Kanban',
      description: 'Implement drag and drop',
      priority: 'medium',
      status: 'in-progress',
      dueDate: toTimestamp(tomorrow),
    },
    {
      id: '3',
      title: 'Write tests',
      description: 'Add Vitest tests',
      priority: 'low',
      status: 'done',
    },
    {
      id: '4',
      title: 'Fix old bug',
      description: 'Fix an old issue',
      priority: 'high',
      status: 'todo',
      dueDate: toTimestamp(yesterday),
    },
    {
      id: '5',
      title: 'Future task',
      description: 'Something for later',
      priority: 'medium',
      status: 'todo',
      dueDate: toTimestamp(upcoming),
    },
  ];

  const createFilters = (
    overrides: Partial<{
      search: string;
      status: Task['status'] | 'all';
      priority: Task['priority'] | 'all';
      dueDate: DueDateFilter;
    }> = {},
  ) => ({
    search: '',
    status: 'all' as const,
    priority: 'all' as const,
    dueDate: 'all' as const,
    ...overrides,
  });

  it('returns all tasks when no filters are active', () => {
    const result = filterTasks(tasksForFiltering, createFilters());

    expect(result.map((task) => task.id)).toEqual(['1', '2', '3', '4', '5']);
  });

  it('filters tasks by title', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        search: 'kanban',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['2']);
  });

  it('filters tasks by description', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        search: 'hooks',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['1']);
  });

  it('search is case-insensitive', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        search: 'REACT',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['1']);
  });

  it('filters tasks by status', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        status: 'done',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['3']);
  });

  it('filters tasks by priority', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        priority: 'high',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['1', '4']);
  });

  it('filters tasks without a due date', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        dueDate: 'none',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['3']);
  });

  it('filters tasks due today', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        dueDate: 'today',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['1']);
  });

  it('filters tasks due tomorrow', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        dueDate: 'tomorrow',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['2']);
  });

  it('filters overdue tasks', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        dueDate: 'overdue',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['4']);
  });

  it('filters upcoming tasks', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        dueDate: 'upcoming',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['5']);
  });

  it('filters tasks using multiple filters', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        status: 'todo',
        priority: 'high',
      }),
    );

    expect(result.map((task) => task.id)).toEqual(['1', '4']);
  });

  it('returns an empty array when no tasks match', () => {
    const result = filterTasks(
      tasksForFiltering,
      createFilters({
        search: 'something that does not exist',
      }),
    );

    expect(result).toEqual([]);
  });
});

describe('sortTasks', () => {
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      priority: 'low',
      status: 'todo',
      dueDate: 1000,
    },
    {
      id: '2',
      title: 'Task 2',
      priority: 'high',
      status: 'todo',
      dueDate: 3000,
    },
    {
      id: '3',
      title: 'Task 3',
      priority: 'medium',
      status: 'todo',
      dueDate: 2000,
    },
    {
      id: '4',
      title: 'Task 4',
      priority: 'high',
      status: 'todo',
    },
  ];

  it('keeps original order for manual sorting', () => {
    const result = sortTasks(tasks, 'manual');

    expect(result.map((task) => task.id)).toEqual(['1', '2', '3', '4']);
  });

  it('sorts tasks by due date ascending', () => {
    const result = sortTasks(tasks, 'due-asc');

    expect(result.map((task) => task.id)).toEqual(['1', '3', '2', '4']);
  });

  it('sorts tasks by due date descending', () => {
    const result = sortTasks(tasks, 'due-desc');

    expect(result.map((task) => task.id)).toEqual(['2', '3', '1', '4']);
  });

  it('keeps the original order of tasks without due dates', () => {
    const tasksWithoutDueDates: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        priority: 'low',
        status: 'todo',
      },
      {
        id: '2',
        title: 'Task 2',
        priority: 'high',
        status: 'todo',
      },
    ];

    const result = sortTasks(tasksWithoutDueDates, 'due-asc');

    expect(result.map((task) => task.id)).toEqual(['1', '2']);
  });

  it('keeps the original order of tasks without due dates when sorting descending', () => {
    const tasksWithoutDueDates: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        priority: 'low',
        status: 'todo',
      },
      {
        id: '2',
        title: 'Task 2',
        priority: 'high',
        status: 'todo',
      },
    ];

    const result = sortTasks(tasksWithoutDueDates, 'due-desc');

    expect(result.map((task) => task.id)).toEqual(['1', '2']);
  });

  it('sorts tasks by priority ascending', () => {
    const result = sortTasks(tasks, 'priority-asc');

    expect(result.map((task) => task.id)).toEqual(['1', '3', '2', '4']);
  });

  it('sorts tasks by priority descending', () => {
    const result = sortTasks(tasks, 'priority-desc');

    expect(result.map((task) => task.id)).toEqual(['2', '4', '3', '1']);
  });

  it('does not mutate the original array', () => {
    const original = [...tasks];

    sortTasks(tasks, 'due-asc');

    expect(tasks).toEqual(original);
  });
});
