import process from 'node:process';

export const testDatabaseURL =
  process.env.E2E_DATABASE_URL ??
  'postgresql://kanban:kanban@localhost:5432/kanban_test';

if (new URL(testDatabaseURL).pathname !== '/kanban_test') {
  throw new Error('E2E_DATABASE_URL must point to kanban_test');
}
