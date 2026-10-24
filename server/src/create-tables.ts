import { pool } from './db.js';

await pool.query(`
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date BIGINT,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at BIGINT,
    position INTEGER NOT NULL
  );
`);

console.log('Tasks table created');

await pool.end();
