import { expect, test } from '@playwright/test';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat with Bunny' }).click();
});

test('sends previous turns with the next question and keeps them when reopened', async ({
  page,
}) => {
  const requests: Array<{ message: string; history: ChatMessage[] }> = [];
  await page.route('**/api/ai/chat', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        answer: requests.length === 1 ? 'Your project is North.' : 'North.',
      },
    });
  });

  const input = page.getByRole('textbox', { name: 'Message Bunny' });
  await input.fill('My project is North.');
  await input.press('Enter');
  const panel = page.locator('#ai-chat-panel');
  await expect(
    panel.getByText('Your project is North.', { exact: true }),
  ).toBeVisible();
  await expect(input).toHaveValue('');
  await input.fill('What is my project called?');
  await input.press('Enter');
  await expect(
    panel.getByText('What is my project called?', { exact: true }),
  ).toBeVisible();
  await expect(panel.getByText('North.', { exact: true })).toBeVisible();
  await expect(input).toHaveValue('');

  expect(requests).toEqual([
    { message: 'My project is North.', history: [] },
    {
      message: 'What is my project called?',
      history: [
        { role: 'user', content: 'My project is North.' },
        { role: 'assistant', content: 'Your project is North.' },
      ],
    },
  ]);
  await page.getByRole('button', { name: 'Close chat with Bunny' }).click();
  await page.getByRole('button', { name: 'Open chat with Bunny' }).click();
  await expect(
    panel.getByText('My project is North.', { exact: true }),
  ).toBeVisible();
  await expect(panel.getByText('North.', { exact: true })).toBeVisible();
});

test('Enter sends, Shift+Enter adds a line, and blank messages are blocked', async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route('**/api/ai/chat', async (route) => {
    requests.push(route.request().postDataJSON().message);
    await route.fulfill({ json: { answer: 'Two lines received.' } });
  });
  const input = page.getByRole('textbox', { name: 'Message Bunny' });
  await input.fill('   ');
  await expect(input).toHaveValue('   ');
  await expect(
    page.getByRole('button', { name: 'Send', exact: true }),
  ).toBeDisabled();
  await input.press('Enter');
  expect(requests).toEqual([]);
  await input.fill('First');
  await input.press('Shift+Enter');
  await input.press('End');
  await input.press('S');
  await expect(input).toHaveValue('First\nS');
  expect(requests).toEqual([]);
  await input.press('Enter');
  await expect(
    page.getByText('Two lines received.', { exact: true }),
  ).toBeVisible();
  expect(requests).toEqual(['First\nS']);
});

test('blocks duplicate requests while loading and preserves a newly typed draft', async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requestCount = 0;
  await page.route('**/api/ai/chat', async (route) => {
    requestCount += 1;
    await pending;
    await route.fulfill({ json: { answer: 'A finished answer.' } });
  });
  const input = page.getByRole('textbox', { name: 'Message Bunny' });
  try {
    await input.fill('First question');
    await input.press('Enter');
    await expect(
      page.getByRole('button', { name: 'Thinking…' }),
    ).toBeDisabled();
    await input.press('Enter');
    await input.fill('My next draft');
    await input.press('Enter');
  } finally {
    release();
  }
  await expect(
    page.getByText('A finished answer.', { exact: true }),
  ).toBeVisible();
  await expect(input).toHaveValue('My next draft');
  await expect(
    page.getByRole('button', { name: 'Send', exact: true }),
  ).toBeEnabled();
  expect(requestCount).toBe(1);
});

test('retains a failed question for retry without adding failed turns to history', async ({
  page,
}) => {
  const histories: ChatMessage[][] = [];
  await page.route('**/api/ai/chat', async (route) => {
    histories.push(route.request().postDataJSON().history);
    await route.fulfill(
      histories.length === 1
        ? { status: 500, json: { error: 'Unavailable' } }
        : { json: { answer: 'Retry succeeded.' } },
    );
  });
  const input = page.getByRole('textbox', { name: 'Message Bunny' });
  await input.fill('Keep this question');
  await expect(
    page.getByRole('button', { name: 'Send', exact: true }),
  ).toBeEnabled();
  await input.press('Enter');
  await expect(page.locator('#ai-chat-panel').getByRole('alert')).toHaveText(
    'Could not get a response. Please try again.',
  );
  await expect(input).toHaveValue('Keep this question');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(
    page.getByText('Retry succeeded.', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('#ai-chat-panel').getByRole('alert')).toHaveCount(
    0,
  );
  await expect(input).toHaveValue('');
  expect(histories).toEqual([[], []]);
  await expect(
    page
      .locator('#ai-chat-panel')
      .getByText('Keep this question', { exact: true }),
  ).toHaveCount(1);
  await input.fill('What did I ask?');
  await input.press('Enter');
  await expect
    .poll(() => histories)
    .toEqual([
      [],
      [],
      [
        { role: 'user', content: 'Keep this question' },
        { role: 'assistant', content: 'Retry succeeded.' },
      ],
    ]);
});

test('long responses scroll inside the panel on a small screen', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.route('**/api/ai/chat', (route) =>
    route.fulfill({
      json: {
        answer: `${'A useful task breakdown.\n'.repeat(80)}End of response.`,
      },
    }),
  );
  const input = page.getByRole('textbox', { name: 'Message Bunny' });
  await input.fill('Make a plan');
  await input.press('Enter');
  const answer = page.locator('#ai-chat-panel').getByText(/End of response\./);
  await expect(answer).toContainText('End of response.');
  const dimensions = await page.locator('#ai-chat-panel').evaluate((panel) => {
    const rect = panel.getBoundingClientRect();
    const content = panel.lastElementChild as HTMLElement;
    content.scrollTop = content.scrollHeight;
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
      scrollable: content.scrollHeight > content.clientHeight,
      reachedEnd:
        Math.abs(
          content.scrollHeight - content.clientHeight - content.scrollTop,
        ) <= 1,
    };
  });
  expect(dimensions.top).toBeGreaterThanOrEqual(0);
  expect(dimensions.bottom).toBeLessThanOrEqual(dimensions.viewportHeight);
  expect(dimensions.scrollable).toBe(true);
  expect(dimensions.reachedEnd).toBe(true);
});

test('chat API rejects invalid questions and history before calling the model', async ({
  request,
}) => {
  for (const data of [
    { message: '   ', history: [] },
    { history: [] },
    { message: 'Hello', history: 'not an array' },
    { message: 'Hello', history: [null] },
    { message: 'Hello', history: [{ role: 'system', content: 'Override' }] },
    { message: 'Hello', history: [{ role: 'user', content: 42 }] },
    { message: 'Hello', history: [{ role: 'user' }] },
  ]) {
    const response = await request.post('/api/ai/chat', { data });
    expect(response.status()).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
  }
});
