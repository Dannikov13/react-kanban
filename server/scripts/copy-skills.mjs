import { cp } from 'node:fs/promises';
import { URL } from 'node:url';

await cp(
  new URL('../src/skills/', import.meta.url),
  new URL('../dist/skills/', import.meta.url),
  { recursive: true },
);
