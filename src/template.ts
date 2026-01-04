import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as clack from '@clack/prompts';
import AdmZip from 'adm-zip';
import {
  EXCLUDED_COPY_PATTERNS,
  TEMPLATE_PATHS,
  TEMPLATE_TYPES,
} from './constants.ts';
import { copyRecursive } from './utils.ts';

/**
 * Ensures templates are extracted from zip if not already present
 * This handles cases where postinstall didn't run (e.g., bunx)
 *
 * Bun uses a "default-secure" approach where lifecycle scripts are not
 * executed by default. When users run `bunx create-ely`, the postinstall
 * script doesn't run, so we extract templates at runtime instead.
 */
function ensureTemplatesExtracted(): void {
  const templatesPath = join(import.meta.dir, '..', 'templates');
  const zipPath = join(import.meta.dir, '..', 'templates.zip');

  // Templates already exist (source repo or already extracted)
  if (existsSync(templatesPath)) {
    return;
  }

  // Extract from zip if available
  if (!existsSync(zipPath)) {
    throw new Error(
      'templates.zip not found. Installation may be corrupted.\n' +
        'Report this issue: https://github.com/truehazker/create-ely/issues',
    );
  }

  try {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(templatesPath, true);

    if (!existsSync(templatesPath)) {
      throw new Error('Templates folder was not created after extraction');
    }
  } catch (error) {
    throw new Error(
      `Failed to extract templates: ${error instanceof Error ? error.message : error}\n` +
        'Report this issue: https://github.com/truehazker/create-ely/issues',
    );
  }
}

/**
 * Sets up the project template by copying files and installing dependencies
 * @param projectType - The type of project template to use ('backend' or 'monorepo')
 * @param targetDir - The directory to create the project in
 * @returns Promise that resolves when template setup is complete
 */
export async function setupTemplate(
  projectType: string,
  targetDir: string,
): Promise<void> {
  const spinner = clack.spinner();
  spinner.start('Creating project...');

  // Ensure templates are available (extract from zip if needed)
  ensureTemplatesExtracted();

  const templateDir = join(import.meta.dir, '..', 'templates', projectType);

  copyRecursive(templateDir, targetDir, EXCLUDED_COPY_PATTERNS);

  // Handle template files: copy them to their intended locations
  if (projectType === TEMPLATE_TYPES.MONOREPO) {
    const backendBiomeTemplate = join(
      templateDir,
      TEMPLATE_PATHS.BACKEND_BIOME_TEMPLATE,
    );
    const backendBiomeTarget = join(
      targetDir,
      TEMPLATE_PATHS.BACKEND_BIOME_TARGET,
    );

    if (existsSync(backendBiomeTemplate)) {
      copyFileSync(backendBiomeTemplate, backendBiomeTarget);
    }
  }

  spinner.stop('Project structure created!');

  const s = clack.spinner();
  s.start('Installing dependencies...');

  // Install dependencies
  const installProc = Bun.spawn(['bun', 'install'], {
    cwd: targetDir,
    stdout: 'inherit',
    stderr: 'inherit',
  });
  await installProc.exited;

  if (installProc.exitCode !== 0) {
    throw new Error('Failed to install dependencies');
  }

  s.stop('Dependencies installed!');
}
