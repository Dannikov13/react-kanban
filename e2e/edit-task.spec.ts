import { expect, test, uniqueTitle } from './board-fixture';
import { createTask } from './helpers';

test('user can edit a task', async ({ page }) => {
  const task = await createTask(
    page,
    uniqueTitle('Setup project'),
    'Configure project',
  );
  const updatedTitle = uniqueTitle('Updated project');

  const taskCard = task.locator('xpath=ancestor::article');

  await taskCard.getByRole('button', { name: 'Edit' }).click();

  const editor = page.locator('article').filter({
    has: page.getByRole('heading', { name: 'Edit task', exact: true }),
  });
  const editTitle = editor.getByLabel('Title', { exact: true });
  const editDescription = editor.getByLabel('Description');
  const editPriority = editor.getByLabel('Priority');
  const editStatus = editor.getByLabel('Status');

  await expect(editTitle).toBeVisible();

  await editTitle.fill(updatedTitle);
  await editDescription.fill('Updated project description');

  await editPriority.selectOption('high');
  await editStatus.selectOption('done');

  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(
    page.getByRole('heading', { name: updatedTitle, exact: true }),
  ).toBeVisible();

  const updatedTask = page
    .getByRole('heading', { name: updatedTitle, exact: true })
    .locator('xpath=ancestor::article');

  await expect(updatedTask).toContainText('Updated project description');
  await expect(updatedTask).toContainText('high');
  await expect(updatedTask).toContainText('done');
});
