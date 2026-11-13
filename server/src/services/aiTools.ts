import { TASK_PRIORITIES, TASK_STATUSES } from '../constants/task.js';
import { CreateTaskData } from '../types/task.js';

export const proposeTaskTool = {
  type: 'function',
  function: {
    name: 'propose_task',
    description:
      'Propose a Kanban task for user confirmation. This does not save it.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        priority: { type: 'string', enum: TASK_PRIORITIES },
        status: { type: 'string', enum: TASK_STATUSES },
      },
      required: ['title', 'priority', 'status'],
      additionalProperties: false,
    },
  },
};

export function parseProposedTask(json: string): CreateTaskData {
  const value: unknown = JSON.parse(json);

  if (
    typeof value !== 'object' ||
    value === null ||
    !('title' in value) ||
    !('priority' in value) ||
    !('status' in value)
  ) {
    throw new Error('Bunny вернул неверные данные задачи');
  }

  if (typeof value.title !== 'string' || !value.title.trim()) {
    throw new Error('Bunny вернул пустое название задачи');
  }

  const priority = TASK_PRIORITIES.find((item) => item === value.priority);
  const status = TASK_STATUSES.find((item) => item === value.status);

  if (!priority || !status) {
    throw new Error('Bunny вернул неверный приоритет или статус');
  }

  return { title: value.title.trim(), priority, status };
}
