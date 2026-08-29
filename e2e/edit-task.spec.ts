import { expect, test } from '@playwright/test';

test('user can edit a task', async ({ page }) => {
  await page.goto('/');

  const task = page.getByRole('heading', { name: 'Setup project' });

  await expect(task).toBeVisible();

  const taskCard = task.locator('xpath=ancestor::article');

  await taskCard.getByRole('button', { name: 'Edit' }).click();

  const editTitle = page.getByLabel('Title').last();
  const editDescription = page.getByLabel('Description').last();
  const editPriority = page.getByLabel('Priority').last();
  const editStatus = page.getByLabel('Status').last();

  await expect(editTitle).toBeVisible();

  await editTitle.fill('Updated project');
  await editDescription.fill('Updated project description');

  await editPriority.selectOption('high');
  await editStatus.selectOption('done');

  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(
    page.getByRole('heading', { name: 'Updated project' }),
  ).toBeVisible();

  const updatedTask = page
    .getByRole('heading', { name: 'Updated project' })
    .locator('xpath=ancestor::article');

  await expect(updatedTask).toContainText('Updated project description');
  await expect(updatedTask).toContainText('high');
  await expect(updatedTask).toContainText('done');
});
