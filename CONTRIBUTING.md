# Contributing

## Project Structure

```text
templates/
├── backend -> monorepo/apps/backend  # Symlink (for standalone template)
└── monorepo/
    ├── apps/
    │   ├── backend/                  # Git submodule (elysia-boilerplate)
    │   └── frontend/
    └── package.json
```

The backend is a **git submodule** at `templates/monorepo/apps/backend` pointing to [elysia-boilerplate](https://github.com/truehazker/elysia-boilerplate). The standalone backend template is a symlink to the submodule.

> **Why this structure?** Bun workspaces don't follow symlinks when resolving workspace packages. The submodule must be inside `apps/` for `bun install` to work in the monorepo during development.

## Setup

```bash
# Clone with submodules
git clone --recursive https://github.com/truehazker/create-elysiajs

# Or if already cloned
git submodule update --init
```

## Versioning Strategy

| Repo | Version | Purpose |
| ---- | ------- | ------- |
| `create-elysiajs` | Own version | CLI tool, frontend template, monorepo setup |
| `elysia-boilerplate` | Pinned tag | Backend template (submodule) |

The submodule is pinned to a **specific release tag** (e.g., `v0.4.4`). This ensures:

- **Stability** - Breaking changes in the boilerplate won't break the CLI
- **Control** - Updates are intentional and tested
- **Reproducibility** - Same CLI version always produces the same output

## Updating Backend Template

```bash
cd templates/monorepo/apps/backend
git fetch --tags
git checkout v0.5.0  # desired version
cd ../../../..
git add templates/monorepo/apps/backend
git commit -m "chore: bump backend template to v0.5.0"
```

Always test after updating:

```bash
bun run src/index.ts
```

## Making Changes

| What | Where |
| ---- | ----- |
| Backend template | [elysia-boilerplate](https://github.com/truehazker/elysia-boilerplate) repo |
| Frontend template | `templates/monorepo/apps/frontend/` |
| Monorepo config | `templates/monorepo/package.json` |
| CLI logic | `src/index.ts` |

## Development

```bash
bun install              # Install dependencies
bun run src/index.ts     # Test the CLI
bun run lint             # Lint
bun run build            # Build
```
