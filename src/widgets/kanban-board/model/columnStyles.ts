import type { TaskStatus } from '@/entities/task';

export const columnStyles: Record<
  TaskStatus,
  {
    container: string;
    badge: string;
  }
> = {
  todo: {
    container: 'bg-slate-100 dark:bg-slate-800',
    badge: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  },

  'in-progress': {
    container: 'bg-amber-50 dark:bg-amber-950/40',
    badge:
      'bg-amber-200 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
  },

  done: {
    container: 'bg-green-50 dark:bg-green-950/40',
    badge:
      'bg-green-200 text-green-800 dark:bg-green-900/60 dark:text-green-200',
  },
};
