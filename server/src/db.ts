import pg from 'pg';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const envPath = fileURLToPath(new URL('../.env', import.meta.url));

if (existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be set in the server environment');
}

export const pool = new Pool({ connectionString });

pool.on('error', (error: Error) => {
  console.error('Unexpected error from an idle PostgreSQL client', error);
});
