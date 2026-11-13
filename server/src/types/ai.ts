import { CreateTaskData } from './task.js';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type AiTaskProposal = {
  type: 'create_task';
  task: CreateTaskData;
};

export type AiChatResponse = {
  answer: string;
  proposal?: AiTaskProposal;
};

export function isChatMessage(value: unknown): value is ChatMessage {
  return (
    typeof value === 'object' &&
    value !== null &&
    'role' in value &&
    (value.role === 'user' || value.role === 'assistant') &&
    'content' in value &&
    typeof value.content === 'string'
  );
}
