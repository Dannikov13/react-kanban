import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  getEmbeddings,
  cosineSimilarity,
} from './services/embeddingService.js';

const envPath = fileURLToPath(new URL('../.env', import.meta.url));

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

async function main() {
  const texts = [
    'Изучить архитектуру MCP',
    'Разобраться, как устроен MCP',
    'строение',
    'Купить продукты на ужин',
  ];

  const vectors = await getEmbeddings(texts);
  const original = vectors[0];

  for (let i = 1; i < texts.length; i += 1) {
    const similarity = cosineSimilarity(original, vectors[i]);

    console.log(texts[i], '→', similarity.toFixed(4));
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
