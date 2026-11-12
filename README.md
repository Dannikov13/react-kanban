# Kanban Board

A full-stack Kanban board with drag-and-drop task management and Bunny, an AI assistant that helps plan work using the current board. Built with React, TypeScript, Express, and PostgreSQL.

**[Live Demo](https://dannikov-react-kanban.netlify.app)**

## Features

- Create, edit, and delete tasks
- Move and reorder tasks with drag and drop; positions are saved on the server
- Search by title and description
- Filter by status, priority, and due date; sort by due date or priority
- Choose a due date and time
- Light, dark, and system theme
- Responsive layout, form validation, and a delete confirmation dialog
- Persist tasks in PostgreSQL through the Express API
- Chat with Bunny about current tasks, priorities, and next steps
- Continue a conversation with message history, loading feedback, and retry after errors

## Tech stack

- React 19, TypeScript, and Vite
- Zustand for client-side task state
- Express 5 and PostgreSQL for the API and persistence
- dnd-kit for drag and drop
- Tailwind CSS
- Native Temporal API for dates, times, and due-date calculations
- OpenRouter for Bunny responses
- Vitest and Testing Library for unit tests
- Playwright for end-to-end tests
- ESLint, Prettier, Husky, and GitHub Actions

## Architecture

The frontend uses a lightweight Feature-Sliced Design structure:

- `app` — application entry point and global styles
- `widgets` — the Kanban board and columns
- `features` — user actions such as creating and filtering tasks
- `entities` — task types, state, utilities, and task cards
- `shared` — reusable UI, hooks, and API functions

The backend separates HTTP routes and controllers from task validation and database access:

```text
React UI → Zustand store → API functions → Express routes/controllers
         → TaskService → TaskRepository → PostgreSQL
```

## Requirements

- Node.js 26 (the CI workflow uses Node.js 26)
- PostgreSQL 17, or Docker Compose to run the included database
- A browser with native Temporal API support
- An OpenRouter API key and model ID to use Bunny

## Run locally

1. Install frontend dependencies from the repository root:

   ```bash
   npm ci
   ```

2. Start PostgreSQL using the included Docker Compose configuration:

   ```bash
   docker compose up -d postgres
   ```

   This creates the local `kanban` database with the development credentials in `docker-compose.yml`. If you use an existing PostgreSQL installation instead, create a database and use its credentials in the next step.

3. Copy the backend environment example:

   ```bash
   cp server/.env.example server/.env
   ```

   The example `DATABASE_URL` matches the Docker configuration. Update it if you use a different database. To enable Bunny, add these settings to `server/.env`, replacing both placeholder values:

   ```dotenv
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=your_openrouter_model_id
   ```

   Keep the API key on the server. Task management works without OpenRouter settings; Bunny requires both values and a running database.

4. Install backend dependencies and create the tasks table:

   ```bash
   npm --prefix server ci
   npm --prefix server run db:setup
   ```

5. Start the API from the repository root:

   ```bash
   npm --prefix server run dev
   ```

6. In a second terminal, from the repository root, start the frontend:

   ```bash
   npm run dev
   ```

The Vite development server forwards `/api` requests to `http://localhost:3000`.

## Bunny AI assistant

Open the rabbit button on the board to chat with Bunny. It receives the current board tasks with each question and can suggest priorities or break work into smaller steps. It can read tasks but cannot create, edit, or delete them.

Press Enter to send a message or Shift+Enter for a new line. Conversation history remains available when the panel is closed and reopened, and resets when the page is refreshed.

The backend sends board task data, the current question, and conversation history to OpenRouter to generate a response.

## Deploying the demo

The frontend is hosted on Netlify. The API can be deployed to Render and PostgreSQL hosted on Neon. This setup uses free tiers suitable for a portfolio demo; it is not intended for production workloads.

1. Create a PostgreSQL project on Neon and copy its pooled connection string. Keep it private.
2. Connect this GitHub repository to Render as a Blueprint and deploy `render.yaml` from the `main` branch. Set `DATABASE_URL` to the Neon connection string in Render's environment settings. Add `OPENROUTER_API_KEY` and `OPENROUTER_MODEL` there to enable Bunny.
3. In Neon's SQL Editor, create the `tasks` table once:

   ```sql
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
   ```

4. Copy the API service URL from Render. In Netlify, set `VITE_API_BASE_URL` to that URL (no trailing slash and no `/api` suffix), then redeploy the frontend.
5. Check that `<API URL>/api/health` returns `{"status":"ok"}` and try creating a task in the live demo.

Free hosting services may pause idle instances, so the first request can be slower. Check the hosting providers for current limits. Configure production credentials in provider settings rather than committing them.

## Checks

Run these from the repository root:

```bash
npm run lint
npm run format:check
npm run test -- --run
npm run build
npm --prefix server run typecheck
npm --prefix server test
npm --prefix server run build
```

The frontend Vitest suite covers task utilities, date utilities, and the local-storage hook. The backend has isolated service tests that do not require a database. The GitHub Actions workflow runs frontend/backend checks and a separate Playwright job with PostgreSQL 17 and Chromium.

### End-to-end tests

With the included Docker database, start PostgreSQL and create the separate `kanban_test` database once:

```bash
docker compose up -d postgres
docker exec kanban-postgres createdb -U kanban kanban_test
DATABASE_URL=postgresql://kanban:kanban@localhost:5432/kanban_test npm --prefix server run db:setup
```

Database creation is a one-time step; PostgreSQL must remain running during tests. If you use another PostgreSQL installation, create `kanban_test` there and set `E2E_DATABASE_URL` accordingly.

Install Chromium once, then run from the project root:

```bash
npx playwright install --with-deps chromium
npm run test:e2e:typecheck
npm run test:e2e
```

To run every scenario twice and inspect the HTML report:

```bash
npm run test:e2e -- --repeat-each=2
npx playwright show-report
```

Playwright starts its own backend on port 3001 and frontend on port 5174, and stops both after the run. These ports must be free; existing servers are not reused. The ordinary development servers can remain running on their usual ports.

Both cleanup and the test backend use the same test database URL, defaulting to `postgresql://kanban:kanban@localhost:5432/kanban_test`. Set `E2E_DATABASE_URL` if different credentials or a host are needed; the database name must remain `kanban_test`. Ordinary `DATABASE_URL` and frontend proxy overrides do not select the E2E database or backend.

Global setup verifies the connected database name and the tasks table without deleting existing rows. Each test uses unique names and removes its own tasks afterward, including tasks created through the UI. The suite uses one worker because drag-and-drop saves a snapshot of the whole board. Do not run multiple E2E suites against the same database simultaneously.

Bunny browser tests use prepared API responses, and backend service tests mock the model and task repository. They do not require an OpenRouter key or make real model requests.

### GitHub Actions

Pushing any branch starts the `CI` workflow. Pull requests targeting `main` also trigger it. The workflow has two jobs:

- `checks`: lint, formatting, frontend unit tests/build, backend typecheck/tests/build.
- `Playwright E2E`: an isolated PostgreSQL service with `kanban_test`, schema setup, E2E typecheck, Chromium installation and browser tests.

The test database exists only for that CI job and requires no repository secrets. The browser job starts its own application servers. `VITE_API_BASE_URL` is cleared for E2E so requests always use the local test API.

After pushing, open the repository's **Actions → CI** page and select the run for your commit. Both jobs should be green. Download `playwright-results` from the run's **Artifacts** section to inspect the HTML report and any failure screenshots/traces. A manual **Run workflow** button is available once this workflow is on the default branch. CI validates the application; deployment remains a separate process.
