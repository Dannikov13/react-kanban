import { expect, test } from '@playwright/test';

test('user can create a task', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Title').fill('Playwright test task');

  await page
    .getByLabel('Description')
    .fill('This task was created by Playwright.');

  await page.getByRole('button', { name: 'Create Task' }).click();

  await expect(
    page.getByRole('heading', { name: 'Playwright test task' }),
  ).toBeVisible();

  await expect(
    page.getByText('This task was created by Playwright.'),
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

  const taskTitle = 'Task to delete';

  await page.getByLabel('Title').fill(taskTitle);
  await page.getByRole('button', { name: 'Create Task' }).click();

  const task = page.locator('article').filter({ hasText: taskTitle }).first();

  await expect(task).toBeVisible();

  await task.getByRole('button', { name: 'Delete' }).click();

  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible();

  await expect(
    dialog.getByRole('heading', { name: 'Delete task?' }),
  ).toBeVisible();

  await expect(dialog.getByText('This action cannot be undone.')).toBeVisible();

  await dialog.getByRole('button', { name: 'Delete' }).click();

  await expect(task).not.toBeVisible();
});

test('user can cancel task deletion', async ({ page }) => {
  await page.goto('/');

  const taskTitle = 'Task should remain';

  await page.getByLabel('Title').fill(taskTitle);
  await page.getByRole('button', { name: 'Create Task' }).click();

  const task = page.locator('article').filter({ hasText: taskTitle }).first();

  await expect(task).toBeVisible();

  await task.getByRole('button', { name: 'Delete' }).click();

  const dialog = page.getByRole('dialog');

  await expect(dialog).toBeVisible();

  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await expect(dialog).not.toBeVisible();
  await expect(task).toBeVisible();
});
