export async function askOpenRouter(message: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;

  if (!apiKey || !model) {
    throw new Error('Не настроены OPENROUTER_API_KEY или OPENROUTER_MODEL');
  }

  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  if (!response.ok) {
    throw new Error(`Ошибка OpenRouter: ${response.status}`);
  }

  const data = await response.json();

  const answer = data.choices?.[0]?.message?.content;

  if (typeof answer !== 'string' || answer.trim() === '') {
    throw new Error('OpenRouter не вернул текст ответа');
  }

  return answer;
}
