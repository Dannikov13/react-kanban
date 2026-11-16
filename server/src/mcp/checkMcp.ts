import { toModelTool } from '../services/aiTools.js';

import { withKanbanMcp } from './withKanbanMcp.js';

async function main() {
  await withKanbanMcp(async (client) => {
    const { tools } = await client.listTools();

    console.log('Инструменты в формате модели:');

    console.dir(tools.map(toModelTool), { depth: null });

    const allTasks = await client.callTool({
      name: 'list_tasks',
      arguments: {},
    });

    console.log('Все карточки, которые видит MCP:');
    console.dir(allTasks, { depth: null });

    const result = await client.callTool({
      name: 'search_tasks',
      arguments: {
        query: 'архитектуру',
      },
    });

    console.dir(result, { depth: null });

    if (result.isError) {
      throw new Error('Инструмент search_tasks завершился с ошибкой');
    }
  });
}

main().catch((error: unknown) => {
  console.error('Ошибка проверки MCP:', error);
  process.exitCode = 1;
});
