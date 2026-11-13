import type { CreateTaskData } from '@/entities/task';

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

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(
  /\/$/,
  '',
);

export async function sendAiMessage(
  message: string,
  history: ChatMessage[],
): Promise<AiChatResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    throw new Error('Could not get a response from Bunny');
  }

  const data = await response.json();

  if (typeof data?.answer !== 'string' || data.answer.trim() === '') {
    throw new Error('Bunny returned an empty response');
  }

  return {
    answer: data.answer,
    proposal: data.proposal,
  };
}
