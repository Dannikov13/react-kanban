import process from 'node:process';
import { testDatabaseURL } from './test-config.js';

export default async function globalSetup() {
  process.env.DATABASE_URL = testDatabaseURL;
  const { pool } = await import('../server/src/db.js');

  try {
    const result = await pool.query<{ database: string }>(
      'SELECT current_database() AS database',
    );

    if (result.rows[0]?.database !== 'kanban_test') {
      throw new Error(
        'E2E setup requires kanban_test. Set E2E_DATABASE_URL to the test database.',
      );
    }

    // Verify the schema before opening browsers; each test cleans up its own rows.
    await pool.query('SELECT id FROM tasks LIMIT 0');
  } finally {
    await pool.end();
  }
}
