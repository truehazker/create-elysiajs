# Monorepo Template

This is a monorepo template containing a full-stack application with a backend (ElysiaJS) and frontend (React) application.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- [Podman](https://podman.io) (for running auxiliary services)

### Setup Steps

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure environment variables**

   Each app requires its own `.env` file. Please check each app's README for specific environment variable requirements:

   - **Backend**: See [apps/backend/README.md](./apps/backend/README.md) for required environment variables (e.g., `DATABASE_URL`, `SERVER_PORT`, etc.)
   - **Frontend**: See [apps/frontend/README.md](./apps/frontend/README.md) for required environment variables (e.g., `VITE_API_URL`)

3. **Start auxiliary services with Podman**

   The backend requires a PostgreSQL database. You can start it using Podman or Docker:

   ```bash
   cd apps/backend
   podman compose up -d elysia-boilerplate-postgres
   ```

   This will start a PostgreSQL database container that the backend application can connect to.

4. **Run database migrations**

   ```bash
   cd apps/backend
   bun run db:migrate
   ```

5. **Start the applications**

   In separate terminals:

   ```bash
   # Terminal 1: Start backend
   cd apps/backend
   bun run dev

   # Terminal 2: Start frontend
   cd apps/frontend
   bun run dev
   ```

## Project Structure

```text
.
├── apps/
│   ├── backend/     # ElysiaJS API server
│   └── frontend/    # React frontend application
├── package.json     # Root package.json for workspace management
└── README.md        # This file
```

## Additional Information

For more detailed information about each application, please refer to their respective README files:

- [Backend README](./apps/backend/README.md)
- [Frontend README](./apps/frontend/README.md)
