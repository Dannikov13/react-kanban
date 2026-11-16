import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  cosineSimilarity,
  getEmbeddings,
} from '../services/embeddingService.js';

import { TaskRepository } from '../repositories/taskRepository.js';

export function createMcpServer() {
  const server = new McpServer({
    name: 'kanban',
    version: '1.0.0',
  });

  const taskRepository = new TaskRepository();

  server.registerTool(
    'list_tasks',
    {
      description: 'Get all tasks from the Kanban board.',
      inputSchema: {},
    },
    async () => {
      const tasks = await taskRepository.findAll();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tasks),
          },
        ],
      };
    },
  );

  server.registerTool(
    'search_tasks',
    {
      description:
        'Find up to 3 Kanban tasks closest in meaning to the query. Results are ranked by cosine similarity and may include unrelated tasks.',
      inputSchema: {
        query: z.string().trim().min(1).max(200),
      },
    },
    async ({ query }) => {
      const tasks = await taskRepository.findAll();

      if (tasks.length === 0) {
        return {
          content: [{ type: 'text', text: '[]' }],
        };
      }

      const texts = tasks.map(
        (task) => `${task.title}\n${task.description ?? ''}`,
      );

      const vectors = await getEmbeddings([query, ...texts]);
      const queryVector = vectors[0];
      const taskVectors = vectors.slice(1);

      const matches = tasks
        .map((task, index) => ({
          ...task,
          similarity: cosineSimilarity(queryVector, taskVectors[index]),
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(matches),
          },
        ],
      };
    },
  );

  return server;
}
