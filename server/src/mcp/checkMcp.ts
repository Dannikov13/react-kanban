import { toModelTool } from '../services/aiTools.js';

import { withKanbanMcp } from './withKanbanMcp.js';

async function main() {
  await withKanbanMcp(async (client) => {
    const { tools } = await client.listTools();

    console.log('Инструменты в формате модели:');

    console.dir(tools.map(toModelTool), { depth: null });

    const result = await client.callTool({
      name: 'list_tasks',
      arguments: {},
    });

    console.dir(result, { depth: null });

    if (result.isError) {
      throw new Error('Инструмент list_tasks завершился с ошибкой');
    }
  });
}

main().catch((error: unknown) => {
  console.error('Ошибка проверки MCP:', error);
  process.exitCode = 1;
});
