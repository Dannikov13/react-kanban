# Kanban Board

A full-stack Kanban board built with React, TypeScript, Express, and PostgreSQL. The project demonstrates task management, drag-and-drop ordering, client/server state synchronization, and automated checks.

**[Live Demo](https://dannikov-react-kanban.netlify.app)**

## Features

- Create, edit, and delete tasks
- Move and reorder tasks with drag and drop; positions are saved on the server
- Search by title and description
- Filter by status, priority, and due date; sort by priority
- Choose a due date and time
- Light, dark, and system theme
- Responsive layout, form validation, and a delete confirmation dialog
- Persist tasks in PostgreSQL through the Express API

## Tech stack

- React 19, TypeScript, and Vite
- Zustand for client-side task state
- Express 5 and PostgreSQL for the API and persistence
- dnd-kit for drag and drop
- Tailwind CSS
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
- PostgreSQL

## Run locally

1. Install frontend dependencies from the repository root:

   ```bash
   npm ci
   ```

2. Create a PostgreSQL user and database. For example, in `psql`:

   ```sql
   CREATE ROLE kanban LOGIN PASSWORD 'choose-a-local-password';
   CREATE DATABASE kanban OWNER kanban;
   ```

   Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` to match your local database credentials.

3. Install backend dependencies and create the tasks table:

   ```bash
   cd server
   npm ci
   npm run db:setup
   ```

4. Start the API in the `server` directory:

   ```bash
   npm run dev
   ```

5. In a second terminal, from the repository root, start the frontend:

   ```bash
   npm run dev
   ```

The Vite development server forwards `/api` requests to `http://localhost:3000`.

## Checks

Run these from the repository root:

```bash
npm run lint
npm run format:check
npm run test -- --run
npm run build
```

The frontend Vitest suite covers task utilities, date utilities, and the local-storage hook. The backend has isolated service tests that do not require a database. Playwright end-to-end specs are in `e2e/`; they require the API and PostgreSQL to be running. The GitHub Actions workflow runs frontend and backend checks but does not run those E2E specs yet.

## License

This project is for portfolio and educational purposes.
