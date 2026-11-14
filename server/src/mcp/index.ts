import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createMcpServer } from './createMcpServer.js';

async function main() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error('Kanban MCP server started');
}

main().catch((error: unknown) => {
  console.error('Failed to start Kanban MCP server:', error);
  process.exitCode = 1;
});
