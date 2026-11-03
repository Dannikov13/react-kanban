import { createTask } from './helpers';
import { test, expect, taskCard, uniqueTitle } from './board-fixture';

test('user can search tasks by title', async ({ page }) => {
  const title = uniqueTitle('Search title task');
  await createTask(page, title);
  await page.getByLabel('Search tasks').fill(title);

  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
});

test('user can search tasks by description', async ({ page, seedTask }) => {
  const unrelated = await seedTask();
  const title = uniqueTitle('Search description task');
  const description = uniqueTitle('Unique searchable description');
  await createTask(page, title, description);
  await expect(taskCard(page, unrelated.title)).toBeVisible();
  await page.getByLabel('Search tasks').fill(description);
  await expect(taskCard(page, unrelated.title)).toHaveCount(0);

  await expect(
    page.getByRole('heading', { name: title, exact: true }),
  ).toBeVisible();
});

test('user can clear the search', async ({ page }) => {
  const taskName = uniqueTitle('Clear search task');
  await createTask(page, taskName);

  const searchInput = page.getByLabel('Search tasks');

  await searchInput.fill(taskName);

  await expect(page.getByRole('heading', { name: taskName })).toBeVisible();

  await page.getByRole('button', { name: 'Clear search' }).click();

  await expect(page.getByRole('heading', { name: taskName })).toBeVisible();
});

test('user can filter tasks by status', async ({ page }) => {
  await page.goto('/');

  const todoTask = uniqueTitle('Todo Playwright task');
  const doneTask = uniqueTitle('Done Playwright task');

  await page.getByLabel('Title').fill(todoTask);
  await page.getByRole('button', { name: 'Create Task' }).click();

  await page.getByLabel('Title').fill(doneTask);
  await page.getByRole('button', { name: 'Create Task' }).click();

  const todoCard = page
    .getByRole('heading', { name: todoTask })
    .locator('xpath=ancestor::article');

  const doneCard = page
    .getByRole('heading', { name: doneTask })
    .locator('xpath=ancestor::article');

  await expect(todoCard).toBeVisible();
  await expect(doneCard).toBeVisible();

  await doneCard.getByRole('button', { name: 'Edit' }).click();

  await page.getByLabel('Status').last().selectOption('done');
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(doneCard).toContainText('done');

  await page.getByLabel('Status').first().selectOption('done');

  await expect(doneCard).toBeVisible();
  await expect(todoCard).not.toBeVisible();
});

test('user can filter tasks by priority', async ({ page }) => {
  await page.goto('/');

  const lowPriorityTask = uniqueTitle('Low priority Playwright task');
  const highPriorityTask = uniqueTitle('High priority Playwright task');

  await page.getByLabel('Title').fill(lowPriorityTask);
  await page.getByRole('button', { name: 'Create Task' }).click();

  await page.getByLabel('Title').fill(highPriorityTask);

  const createForm = page.locator('form').filter({
    has: page.getByRole('heading', { name: 'Create Task' }),
  });

  await createForm.locator('#priority').click();

  const createPriorityListbox = page.getByRole('listbox').last();

  await createPriorityListbox.getByRole('option', { name: 'High' }).click();

  await page.getByRole('button', { name: 'Create Task' }).click();

  const lowPriorityCard = page
    .getByRole('heading', { name: lowPriorityTask })
    .locator('xpath=ancestor::article');

  const highPriorityCard = page
    .getByRole('heading', { name: highPriorityTask })
    .locator('xpath=ancestor::article');

  await expect(lowPriorityCard).toBeVisible();
  await expect(highPriorityCard).toBeVisible();

  await page.locator('#priority-filter').selectOption('high');

  await expect(highPriorityCard).toBeVisible();
  await expect(lowPriorityCard).not.toBeVisible();
});

test('user can filter tasks by due date', async ({ page }) => {
  await page.goto('/');

  const noDueDateTask = uniqueTitle('No due date Playwright task');
  const todayTask = uniqueTitle('Today Playwright task');

  await page.getByLabel('Title').fill(noDueDateTask);
  await page.getByRole('button', { name: 'Create Task' }).click();

  await page.getByLabel('Title').fill(todayTask);

  const createForm = page.locator('form').filter({
    has: page.getByRole('heading', { name: 'Create Task' }),
  });

  await createForm.getByRole('button', { name: 'Select date & time' }).click();

  await page.getByRole('button', { name: 'Today' }).click();

  await page.getByRole('button', { name: 'Done' }).click();

  await page.getByRole('button', { name: 'Create Task' }).click();

  const noDueDateCard = page
    .getByRole('heading', { name: noDueDateTask })
    .locator('xpath=ancestor::article');

  const todayCard = page
    .getByRole('heading', { name: todayTask })
    .locator('xpath=ancestor::article');

  await expect(noDueDateCard).toBeVisible();
  await expect(todayCard).toBeVisible();

  await page.locator('#due-date-filter').selectOption('today');

  await expect(todayCard).toBeVisible();
  await expect(noDueDateCard).not.toBeVisible();

  await page.locator('#due-date-filter').selectOption('none');

  await expect(noDueDateCard).toBeVisible();
  await expect(todayCard).not.toBeVisible();
});

test('user can sort tasks by priority', async ({ page }) => {
  await page.goto('/');

  const prefix = uniqueTitle('priority sort task');
  const lowTask = `${prefix} low`;
  const mediumTask = `${prefix} medium`;
  const highTask = `${prefix} high`;

  const createForm = page.locator('form').filter({
    has: page.getByRole('heading', { name: 'Create Task' }),
  });

  // Create low priority task
  await page.getByLabel('Title').fill(lowTask);

  await createForm.locator('#priority').click();

  await page
    .getByRole('listbox')
    .last()
    .getByRole('option', { name: 'Low' })
    .click();

  await page.getByRole('button', { name: 'Create Task' }).click();

  // Create medium priority task
  await page.getByLabel('Title').fill(mediumTask);

  await createForm.locator('#priority').click();

  await page
    .getByRole('listbox')
    .last()
    .getByRole('option', { name: 'Medium' })
    .click();

  await page.getByRole('button', { name: 'Create Task' }).click();

  // Create high priority task
  await page.getByLabel('Title').fill(highTask);

  await createForm.locator('#priority').click();

  await page
    .getByRole('listbox')
    .last()
    .getByRole('option', { name: 'High' })
    .click();

  await page.getByRole('button', { name: 'Create Task' }).click();

  // Show only the tasks created by this test.
  await page.getByLabel('Search tasks').fill(prefix);

  const todoColumn = page
    .getByRole('heading', { name: 'Todo' })
    .locator('xpath=ancestor::*[self::section or self::div][1]');

  const todoCards = todoColumn.locator('article');

  await expect(todoCards).toHaveCount(3);

  // Sort by priority ascending: low → medium → high
  await page.locator('#sort-filter').selectOption('priority-asc');

  await expect(todoCards.nth(0)).toContainText(lowTask);
  await expect(todoCards.nth(1)).toContainText(mediumTask);
  await expect(todoCards.nth(2)).toContainText(highTask);

  // Sort by priority descending: high → medium → low
  await page.locator('#sort-filter').selectOption('priority-desc');

  await expect(todoCards.nth(0)).toContainText(highTask);
  await expect(todoCards.nth(1)).toContainText(mediumTask);
  await expect(todoCards.nth(2)).toContainText(lowTask);
});

test('search excludes unrelated tasks and clearing restores them', async ({
  page,
  seedTask,
}) => {
  const matching = await seedTask();
  const unrelated = await seedTask();
  await page.goto('/');
  await expect(taskCard(page, matching.title)).toBeVisible();
  await expect(taskCard(page, unrelated.title)).toBeVisible();
  await page.getByLabel('Search tasks').fill(matching.title.toUpperCase());
  await expect(taskCard(page, matching.title)).toBeVisible();
  await expect(taskCard(page, unrelated.title)).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByLabel('Search tasks')).toHaveValue('');
  await expect(taskCard(page, unrelated.title)).toBeVisible();
});

test('unmatched search shows empty state and no cards', async ({
  page,
  seedTask,
}) => {
  const task = await seedTask();
  await page.goto('/');
  await expect(taskCard(page, task.title)).toBeVisible();
  await page.getByLabel('Search tasks').fill(`Missing ${crypto.randomUUID()}`);
  await expect(page.locator('article')).toHaveCount(0);
  await expect(
    page.getByText('No matching tasks', { exact: true }),
  ).toHaveCount(3);
});
