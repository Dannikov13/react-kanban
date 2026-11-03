import {
  expect,
  test,
  taskCard,
  uniqueTitle,
  reloadTasks,
} from './board-fixture';

test('user can create a task', async ({ page }) => {
  await page.goto('/');

  const title = uniqueTitle('Playwright test task');
  await page.getByLabel('Title').fill(title);

  await page
    .getByLabel('Description')
    .fill('This task was created by Playwright.');

  await page.getByRole('button', { name: 'Create Task' }).click();

  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();

  await expect(
    taskCard(page, title).getByText('This task was created by Playwright.'),
  ).toBeVisible();
});

test('user cannot create a task with an empty title', async ({ page }) => {
  await page.goto('/');

  const titleInput = page.getByLabel('Title');

  await titleInput.fill('Test task');
  await titleInput.fill('');

  await expect(
    page.getByRole('button', { name: 'Create Task' }),
  ).toBeDisabled();
});

test('user can delete a task after confirming', async ({ page }) => {
  await page.goto('/');

  const taskTitle = `Task to delete ${crypto.randomUUID()}`;

  await page.getByLabel('Title').fill(taskTitle);

  const createResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/tasks' &&
      response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Create Task' }).click();
  const createResponse = await createResponsePromise;
  expect(createResponse.ok()).toBeTruthy();

  const createdTask = await createResponse.json();
  const taskId = createdTask.id;

  const task = taskCard(page, taskTitle);

  await expect(task).toBeVisible();

  await task.getByRole('button', { name: 'Delete' }).click();

  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible();

  await expect(
    dialog.getByRole('heading', { name: 'Delete task?' }),
  ).toBeVisible();

  await expect(
    dialog.getByText('Are you sure you want to delete this task?'),
  ).toBeVisible();

  await dialog.getByRole('button', { name: 'Delete' }).click();

  await expect(task).not.toBeVisible();

  const tasks = await reloadTasks(page);
  expect(Array.isArray(tasks)).toBe(true);
  expect(tasks).not.toEqual(
    expect.arrayContaining([expect.objectContaining({ id: taskId })]),
  );
});

test('user can cancel task deletion', async ({ page }) => {
  await page.goto('/');

  const taskTitle = `Task should remain ${crypto.randomUUID()}`;

  await page.getByLabel('Title').fill(taskTitle);

  const createResponsePromise = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname === '/api/tasks' &&
      response.request().method() === 'POST',
  );

  await page.getByRole('button', { name: 'Create Task' }).click();

  const createResponse = await createResponsePromise;
  expect(createResponse.ok()).toBeTruthy();

  const createdTask = await createResponse.json();
  const taskId = createdTask.id;

  const task = taskCard(page, taskTitle);

  await expect(task).toBeVisible();

  await task.getByRole('button', { name: 'Delete' }).click();

  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).not.toBeVisible();
  await expect(task).toBeVisible();

  const tasks = await reloadTasks(page);
  expect(Array.isArray(tasks)).toBe(true);
  expect(tasks).toEqual(
    expect.arrayContaining([expect.objectContaining({ id: taskId })]),
  );

  await expect(task).toBeVisible();
});
