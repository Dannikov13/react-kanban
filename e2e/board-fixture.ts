import {
  test as base,
  expect,
  type Page,
  type Locator,
} from '@playwright/test';
import type { Task } from '../src/entities/task/model/types';

export const taskCard = (page: Page, title: string) =>
  page.locator('article').filter({
    has: page.getByRole('heading', { name: title, exact: true }),
  });

export const column = (page: Page, name: string) =>
  page.locator('section').filter({
    has: page.getByRole('heading', { name, exact: true }),
  });

export async function reloadTasks(page: Page) {
  const requests = new Set<import('@playwright/test').Request>();
  let navigationStarted = false;
  const trackRequest = (request: import('@playwright/test').Request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      navigationStarted = true;
    }
    if (
      navigationStarted &&
      request.method() === 'GET' &&
      new URL(request.url()).pathname === '/api/tasks'
    ) {
      requests.add(request);
    }
  };
  // Ignore late responses from the old page; only read this reload's requests.
  page.on('request', trackRequest);
  const responsePromise = page.waitForResponse((response) =>
    requests.has(response.request()),
  );
  try {
    await page.reload();
    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
    return (await response.json()) as Task[];
  } finally {
    page.off('request', trackRequest);
  }
}

export async function dragTask(
  page: Page,
  card: Locator,
  target: Locator,
  placement: 'before' | 'after' = 'before',
) {
  const handle = card.getByRole('button', { name: 'Drag task' });
  // Make both ends visible before measuring; a target below the viewport
  // would otherwise trigger auto-scroll during the synthetic mouse gesture.
  await target.scrollIntoViewIfNeeded();
  await handle.scrollIntoViewIfNeeded();
  const start = await handle.boundingBox();
  const end = await target.boundingBox();
  if (!start || !end) throw new Error('Drag source or target is not visible');
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2);
  await page.mouse.down();
  const isCard = await target.evaluate(
    (element) => element.tagName === 'ARTICLE',
  );
  await page.mouse.move(
    end.x + end.width / 2,
    end.y + end.height * (isCard ? (placement === 'before' ? 0.1 : 0.8) : 0.5),
    {
      steps: 20,
    },
  );
  if (isCard) {
    await expect(
      target.locator(':scope > div[aria-hidden="true"]'),
    ).toBeVisible();
  }
  await page.mouse.up();
}

export const uniqueTitle = (prefix: string) =>
  `${prefix} ${crypto.randomUUID()}`;

export const test = base.extend<{
  ownedTaskIds: Set<string>;
  seedTask: (data?: Partial<Task>) => Promise<Task>;
  taskCleanup: void;
}>({
  // Playwright requires destructuring even when a fixture has no dependencies.
  // eslint-disable-next-line no-empty-pattern
  ownedTaskIds: async ({}, use) => {
    await use(new Set<string>());
  },
  taskCleanup: [
    async ({ page, ownedTaskIds }, use) => {
      const pending: Promise<void>[] = [];
      const trackCreatedTask = (
        response: import('@playwright/test').Response,
      ) => {
        if (
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname === '/api/tasks' &&
          response.ok()
        ) {
          pending.push(
            response.json().then((task: Task) => {
              ownedTaskIds.add(task.id);
            }),
          );
        }
      };
      page.on('response', trackCreatedTask);
      try {
        await use();
      } finally {
        page.off('response', trackCreatedTask);
        await Promise.all(pending);
        for (const id of ownedTaskIds) {
          const response = await page.request.delete(`/api/tasks/${id}`);
          expect(response.ok() || response.status() === 404).toBeTruthy();
        }
      }
    },
    { auto: true },
  ],
  seedTask: async ({ page, ownedTaskIds }, use) => {
    await use(async (data = {}) => {
      const response = await page.request.post('/api/tasks', {
        data: {
          title: uniqueTitle('E2E'),
          description: 'Original description',
          priority: 'medium',
          status: 'todo',
          ...data,
        },
      });
      expect(response.ok()).toBeTruthy();
      const task = (await response.json()) as Task;
      ownedTaskIds.add(task.id);
      return task;
    });
  },
});

export { expect };
