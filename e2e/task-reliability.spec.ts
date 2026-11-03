import {
  test,
  expect,
  taskCard,
  column,
  reloadTasks,
  dragTask,
  uniqueTitle,
} from './board-fixture';
import type { Route } from '@playwright/test';

const serverError = (route: Route) =>
  route.fulfill({ status: 500, json: { message: 'Simulated server error' } });

test('created task survives reload and the form is cleared', async ({
  page,
}) => {
  const title = `Created ${crypto.randomUUID()}`;
  await page.goto('/');
  await page.getByLabel('Title', { exact: true }).fill(`  ${title}  `);
  await page.getByLabel('Description').fill('Saved description');
  const pending = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      new URL(r.url()).pathname === '/api/tasks',
  );
  await page.getByRole('button', { name: 'Create Task', exact: true }).click();
  const response = await pending;
  expect(response.ok()).toBeTruthy();
  const created = await response.json();
  try {
    await expect(taskCard(page, title)).toBeVisible();
    await expect(page.getByLabel('Title', { exact: true })).toHaveValue('');
    await expect(page.getByLabel('Description')).toHaveValue('');
    const tasks = await reloadTasks(page);
    expect(tasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: created.id,
          title,
          description: 'Saved description',
        }),
      ]),
    );
    await expect(taskCard(page, title)).toBeVisible();
  } finally {
    expect(
      (await page.request.delete(`/api/tasks/${created.id}`)).ok(),
    ).toBeTruthy();
  }
});

test('edited fields and destination column survive reload', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.goto('/');
  const card = taskCard(page, task.title);
  await card.getByRole('button', { name: 'Edit', exact: true }).click();
  const editor = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Edit task', exact: true }),
  });
  const title = `Updated ${crypto.randomUUID()}`;
  await editor.getByLabel('Title', { exact: true }).fill(title);
  await editor.getByLabel('Description').fill('Updated description');
  await editor.getByLabel('Priority').selectOption('high');
  await editor.getByLabel('Status').selectOption('done');
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(taskCard(page, title)).toBeVisible();
  const tasks = await reloadTasks(page);
  expect(tasks).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: task.id,
        title,
        description: 'Updated description',
        priority: 'high',
        status: 'done',
      }),
    ]),
  );
  await expect(
    column(page, 'Done').getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
});

test('cancel editing discards changes and reopening restores original values', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.goto('/');
  const card = taskCard(page, task.title);
  await card.getByRole('button', { name: 'Edit', exact: true }).click();
  const editor = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Edit task', exact: true }),
  });
  await editor.getByLabel('Title', { exact: true }).fill('Unsaved title');
  await editor.getByLabel('Status').selectOption('done');
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  await card.getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(editor.getByLabel('Title', { exact: true })).toHaveValue(
    task.title,
  );
  await expect(editor.getByLabel('Status')).toHaveValue('todo');
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  expect(await reloadTasks(page)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        id: task.id,
        title: task.title,
        status: 'todo',
      }),
    ]),
  );
});

test('whitespace titles cannot be created or saved', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.goto('/');
  await page.getByLabel('Title', { exact: true }).fill('   ');
  await expect(
    page.getByRole('button', { name: 'Create Task', exact: true }),
  ).toBeDisabled();
  await taskCard(page, task.title)
    .getByRole('button', { name: 'Edit', exact: true })
    .click();
  const editor = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Edit task', exact: true }),
  });
  await editor.getByLabel('Title', { exact: true }).fill('   ');
  await expect(
    editor.getByText('Title is required.', { exact: true }),
  ).toBeVisible();
  await expect(
    editor.getByRole('button', { name: 'Save changes' }),
  ).toBeDisabled();
});

test('load failure is shown and a reload can recover', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.route('**/api/tasks', (route) =>
    route.request().method() === 'GET' ? serverError(route) : route.continue(),
  );
  await page.goto('/');
  await expect(page.getByRole('alert')).toHaveText('Failed to load tasks.');
  await page.unroute('**/api/tasks');
  await reloadTasks(page);
  await expect(taskCard(page, task.title)).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('failed creation preserves input and retry creates exactly one task', async ({
  page,
}) => {
  const title = `Retry ${crypto.randomUUID()}`;
  await page.route('**/api/tasks', (route) =>
    route.request().method() === 'POST' ? serverError(route) : route.continue(),
  );
  await page.goto('/');
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByLabel('Description').fill('Keep this description');
  await page.getByRole('button', { name: 'Create Task', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Failed to create task. Please try again.',
  );
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue(title);
  await expect(page.getByLabel('Description')).toHaveValue(
    'Keep this description',
  );
  await expect(taskCard(page, title)).toHaveCount(0);
  await page.unroute('**/api/tasks');
  const pending = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      new URL(r.url()).pathname === '/api/tasks',
  );
  await page.getByRole('button', { name: 'Create Task', exact: true }).click();
  const response = await pending;
  expect(response.ok()).toBeTruthy();
  const task = await response.json();
  try {
    await expect(taskCard(page, title)).toHaveCount(1);
    await expect(page.getByRole('alert')).toHaveCount(0);
    const tasks = await reloadTasks(page);
    expect(tasks.filter((t) => t.title === title)).toHaveLength(1);
  } finally {
    expect(
      (await page.request.delete(`/api/tasks/${task.id}`)).ok(),
    ).toBeTruthy();
  }
});

test('failed edit preserves draft and retry saves it', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.goto('/');
  await page.route(`**/api/tasks/${task.id}`, (route) =>
    route.request().method() === 'PUT' ? serverError(route) : route.continue(),
  );
  await taskCard(page, task.title)
    .getByRole('button', { name: 'Edit', exact: true })
    .click();
  const editor = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Edit task', exact: true }),
  });
  const title = `Draft ${crypto.randomUUID()}`;
  await editor.getByLabel('Title', { exact: true }).fill(title);
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Failed to update task. Please try again.',
  );
  await expect(editor.getByLabel('Title', { exact: true })).toHaveValue(title);
  const stored = await page.request.get('/api/tasks');
  expect(await stored.json()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: task.id, title: task.title }),
    ]),
  );
  await page.unroute(`**/api/tasks/${task.id}`);
  await editor.getByRole('button', { name: 'Save changes' }).click();
  await expect(taskCard(page, title)).toBeVisible();
  expect(await reloadTasks(page)).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: task.id, title })]),
  );
});

test('failed deletion keeps task and confirmation open so retry is possible', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.goto('/');
  await page.route(`**/api/tasks/${task.id}`, (route) =>
    route.request().method() === 'DELETE'
      ? serverError(route)
      : route.continue(),
  );
  const card = taskCard(page, task.title);
  await card.getByRole('button', { name: 'Delete', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText(
    'Failed to delete task. Please try again.',
  );
  await expect(card).toBeVisible();
  await expect(dialog).toBeVisible();
  await page.unroute(`**/api/tasks/${task.id}`);
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(card).toHaveCount(0);
  expect(await reloadTasks(page)).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: task.id })]),
  );
});

for (const fails of [false, true]) {
  test(`drag to another column ${fails ? 'rolls back on server failure' : 'survives reload'}`, async ({
    page,
    seedTask,
  }) => {
    const task = await seedTask();
    await page.goto('/');
    await page.getByLabel('Search tasks').fill(task.title);
    const card = taskCard(page, task.title);
    await expect(card).toBeVisible();
    if (fails) await page.route('**/api/tasks/positions', serverError);
    const pending = page.waitForResponse(
      (r) =>
        r.request().method() === 'PATCH' &&
        new URL(r.url()).pathname === '/api/tasks/positions',
    );
    await dragTask(page, card, column(page, 'In Progress'));
    const response = await pending;
    expect(response.status()).toBe(fails ? 500 : 204);
    const expectedColumn = fails ? 'Todo' : 'In Progress';
    await expect(
      column(page, expectedColumn).getByRole('heading', {
        name: task.title,
        exact: true,
      }),
    ).toBeVisible();
    if (fails)
      await expect(page.getByRole('alert')).toHaveText(
        'Failed to save task positions. Please try again.',
      );
    expect(await reloadTasks(page)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: task.id,
          status: fails ? 'todo' : 'in-progress',
        }),
      ]),
    );
    await expect(
      column(page, expectedColumn).getByRole('heading', {
        name: task.title,
        exact: true,
      }),
    ).toBeVisible();
  });
}

test('manual order within a column survives reload', async ({
  page,
  seedTask,
}) => {
  const prefix = `Reorder ${crypto.randomUUID()}`;
  const first = await seedTask({ title: `${prefix} first` });
  const second = await seedTask({ title: `${prefix} second` });
  await page.goto('/');
  await page.getByLabel('Search tasks').fill(prefix);
  const cards = column(page, 'Todo').locator('article');
  await expect(cards).toHaveCount(2);
  await expect(cards.nth(0)).toContainText(first.title);
  const pending = page.waitForResponse(
    (r) =>
      r.request().method() === 'PATCH' &&
      new URL(r.url()).pathname === '/api/tasks/positions',
  );
  await dragTask(
    page,
    taskCard(page, second.title),
    taskCard(page, first.title),
  );
  expect((await pending).ok()).toBeTruthy();
  await expect(cards.nth(0)).toContainText(second.title);
  const tasks = await reloadTasks(page);
  const saved = tasks.filter(
    (task) => task.id === first.id || task.id === second.id,
  );
  expect(saved.map((task) => task.id)).toEqual([second.id, first.id]);
  await page.getByLabel('Search tasks').fill(prefix);
  await expect(cards.nth(0)).toContainText(second.title);
  await expect(cards.nth(1)).toContainText(first.title);
});

test('drag below a card updates insertion side and persists order', async ({
  page,
  seedTask,
}) => {
  const prefix = uniqueTitle('Reorder down');
  const first = await seedTask({ title: `${prefix} first` });
  const second = await seedTask({ title: `${prefix} second` });
  await page.goto('/');
  await page.getByLabel('Search tasks').fill(prefix);
  const cards = column(page, 'Todo').locator('article');
  await expect(cards).toHaveCount(2);
  const pending = page.waitForResponse(
    (r) =>
      r.request().method() === 'PATCH' &&
      new URL(r.url()).pathname === '/api/tasks/positions',
  );
  await dragTask(
    page,
    taskCard(page, first.title),
    taskCard(page, second.title),
    'after',
  );
  expect((await pending).ok()).toBeTruthy();
  await expect(cards.nth(0)).toContainText(second.title);
  const tasks = await reloadTasks(page);
  expect(
    tasks
      .filter((task) => task.id === first.id || task.id === second.id)
      .map((task) => task.id),
  ).toEqual([second.id, first.id]);
  await page.getByLabel('Search tasks').fill(prefix);
  await expect(cards.nth(0)).toContainText(second.title);
});
