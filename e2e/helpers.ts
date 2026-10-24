import { expect, type Page } from '@playwright/test';

export const createTask = async (
  page: Page,
  title: string,
  description?: string,
) => {
  await page.goto('/');
  await page.getByLabel('Title').fill(title);

  if (description) {
    await page.getByLabel('Description').fill(description);
  }

  await page.getByRole('button', { name: 'Create Task' }).click();

  const task = page.getByRole('heading', { name: title });
  await expect(task).toBeVisible();

  return task;
};
