import { fileURLToPath } from 'node:url';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import {
  getDefaultEnvironment,
  StdioClientTransport,
} from '@modelcontextprotocol/sdk/client/stdio.js';

export async function withKanbanMcp<T>(
  action: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({
    name: 'bunny',
    version: '1.0.0',
  });

  const isTypeScript = import.meta.url.endsWith('.ts');

  const serverPath = fileURLToPath(
    new URL(isTypeScript ? './index.ts' : './index.js', import.meta.url),
  );

  const env = getDefaultEnvironment();

  if (process.env.DATABASE_URL) {
    env.DATABASE_URL = process.env.DATABASE_URL;
  }

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: isTypeScript ? ['--import', 'tsx', serverPath] : [serverPath],
    cwd: fileURLToPath(new URL('../../', import.meta.url)),
    env,
  });

  try {
    await client.connect(transport);

    return await action(client);
  } finally {
    await client.close();
  }
}
