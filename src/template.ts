import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import * as clack from '@clack/prompts';
import {
  EXCLUDED_COPY_PATTERNS,
  TEMPLATE_PATHS,
  TEMPLATE_TYPES,
} from './constants.ts';
import { copyRecursive } from './utils.ts';

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
