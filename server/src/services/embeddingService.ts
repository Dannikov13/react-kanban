import { z } from 'zod';

export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error('Не настроен OPENROUTER_API_KEY');
  }

  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`Ошибка OpenRouter: ${response.status}`);
  }

  const schema = z.object({
    data: z
      .array(
        z.object({
          index: z.number().int().nonnegative(),
          embedding: z.array(z.number()).min(1),
        }),
      )
      .length(texts.length),
  });

  const result = schema.parse(await response.json());
  const items = [...result.data].sort((a, b) => a.index - b.index);

  if (items.some((item, index) => item.index !== index)) {
    throw new Error('OpenRouter вернул неверные индексы эмбеддингов');
  }

  return items.map((item) => item.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Векторы должны быть одинаковой длины');
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);

  if (denominator === 0) {
    throw new Error('Нельзя сравнить нулевой вектор');
  }

  return dot / denominator;
}
