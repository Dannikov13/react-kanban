import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

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

  return server;
}
