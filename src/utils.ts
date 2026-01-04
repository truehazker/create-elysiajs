import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * Recursively copies files and directories from source to destination
 * @param src - Source path to copy from
 * @param dest - Destination path to copy to
 * @param exclude - Array of file/directory names to exclude from copying
 */
export function copyRecursive(
  src: string,
  dest: string,
  exclude: string[] = [],
): void {
  const stats = statSync(src);

  if (stats.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    for (const entry of readdirSync(src)) {
      if (exclude.includes(entry) || entry.endsWith('.template')) continue;

      const srcPath = join(src, entry);
      const destPath = join(dest, entry);
      copyRecursive(srcPath, destPath, exclude);
    }
  } else {
    const destDir = dirname(dest);
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true });
    }
    copyFileSync(src, dest);
  }
}

/**
 * Validates a project name according to npm package naming rules
 * @param value - The project name to validate
 * @returns Error message if invalid, undefined if valid
 */
export function validateProjectName(value: string): string | undefined {
  if (!value || value.trim() === '') {
    return 'Project name is required';
  }

  const trimmed = value.trim();
  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return 'Project name must contain only lowercase letters, numbers, and hyphens';
  }

  if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
    return 'Project name cannot start or end with a hyphen';
  }

  return undefined;
}
