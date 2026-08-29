# Kanban Board

A modern Kanban board application built with React and TypeScript, focused on clean UI, responsive UX, task management, and automated testing.

**[Live Demo](https://dannikov-react-kanban.netlify.app)**

## Features

* Create, edit, and delete tasks
* Task status management
* Task priority management
* Drag and drop with visual drop indicators
* Task reordering
* Search by title and description
* Filter by status, priority, and due date
* Sort tasks by priority
* Due date and time management
* Custom date & time picker
* Light / Dark / System theme
* Responsive layout
* Custom delete confirmation dialog
* Form validation and accessibility improvements
* LocalStorage persistence

## Tech Stack

* React 19
* TypeScript
* Vite
* Tailwind CSS
* dnd-kit
* Temporal API
* Vitest
* Testing Library
* Playwright
* ESLint
* Prettier
* Husky
* GitHub Actions

## Testing

The project includes unit, integration, and end-to-end testing.

### Vitest

* Task utilities
* Date and due date utilities
* LocalStorage hook

**45 tests passing**

### Playwright

End-to-end tests cover:

* Task creation
* Form validation
* Task editing
* Task deletion
* Search
* Filtering
* Sorting

## Architecture

The project follows an FSD Lite architecture with a clear separation between:

* `entities` — domain models and task-related logic
* `features` — user-facing functionality
* `widgets` — complex UI blocks
* `shared` — reusable UI components and utilities
* `app` — application setup and global styles

## CI/CD

GitHub Actions automatically runs quality checks for pull requests, including:

* ESLint
* Prettier
* TypeScript type checking
* Production build
* Vitest
* Playwright E2E tests

The application is deployed to Netlify.

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

### Run linting

```bash
npm run lint
```

### Check formatting

```bash
npm run format:check
```

### Run TypeScript checks and build

```bash
npm run build
```

### Run unit tests

```bash
npx vitest run
```

### Run E2E tests

```bash
npx playwright test
```

## Persistence

Tasks are stored in the browser's `localStorage`, so data persists between page reloads on the same browser and device.

## License

This project is created for portfolio and educational purposes.
