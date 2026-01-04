# create-ely

[![Lint](https://github.com/truehazker/create-ely/actions/workflows/lint.yml/badge.svg)](https://github.com/truehazker/create-ely/actions/workflows/lint.yml)
[![npm version](https://img.shields.io/npm/v/create-ely.svg)](https://www.npmjs.com/package/create-ely)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Bun](https://img.shields.io/badge/Bun-000000?logo=bun)](https://bun.sh)
[![ElysiaJS](https://img.shields.io/badge/ElysiaJS-6366f1?logo=elysia&logoColor=white)](https://elysiajs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

The fastest way to scaffold production-ready [ElysiaJS](https://elysiajs.com) projects with [Bun](https://bun.sh).

![Demo](./assets/demo.gif)

## Quick Start

Create a new project:

```bash
bun create ely
```

Or with a project name:

```bash
bun create ely my-project
```

You'll be prompted to choose:

- **Backend Only** - API-first ElysiaJS backend with PostgreSQL, Drizzle ORM, and OpenAPI docs
- **Monorepo** - Full-stack setup with React frontend, TanStack Router, and shared workspace

## What's Included

**Backend Template:**

- PostgreSQL + Drizzle ORM for type-safe database access
- OpenAPI documentation out of the box
- Global error handling and structured logging (Pino)
- Docker support for development and production
- Environment validation with type safety

**Monorepo Template:**

- Everything from Backend template
- React frontend with TanStack Router and Vite
- Bun workspaces for seamless monorepo management

## Contributing

> **⚠️ Important:** This project uses Git submodules for templates. Make sure to clone with `git clone --recurse-submodules` or run `git submodule update --init --recursive` after cloning.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT
