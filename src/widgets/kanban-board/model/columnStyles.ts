import type { TaskStatus } from '@/entities/task';

export const columnStyles: Record<
  TaskStatus,
  {
    container: string;
    badge: string;
  }
> = {
  todo: {
    container: 'bg-slate-100',
    badge: 'bg-slate-200 text-slate-700',
  },

  'in-progress': {
    container: 'bg-amber-50',
    badge: 'bg-amber-200 text-amber-800',
  },

  done: {
    container: 'bg-green-50',
    badge: 'bg-green-200 text-green-800',
  },
};
