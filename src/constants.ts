export const TEMPLATE_TYPES = {
  BACKEND: 'backend',
  MONOREPO: 'monorepo',
} as const;

export const DEFAULT_PROJECT_NAME = 'my-ely-app';

export const PROJECT_NAME_REGEX = /^[a-z0-9-]+$/;

export const EXCLUDED_COPY_PATTERNS = ['node_modules', '.git'];

export const PORTS = {
  BACKEND: 3000,
  FRONTEND: 5173,
} as const;

export const TEMPLATE_PATHS = {
  BACKEND_BIOME_TEMPLATE: 'apps/backend-biome.json.template',
  BACKEND_BIOME_TARGET: 'apps/backend/biome.json',
} as const;
