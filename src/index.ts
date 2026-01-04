#!/usr/bin/env bun
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import * as clack from '@clack/prompts';
import {
  DEFAULT_PROJECT_NAME,
  PORTS,
  PROJECT_NAME_REGEX,
  TEMPLATE_TYPES,
} from './constants.ts';
import { initializeGit } from './git.ts';
import { setupTemplate } from './template.ts';
import { validateProjectName } from './utils.ts';

/**
 * Gets the project name from command line arguments or prompts the user
 * @param args - Command line arguments
 * @returns Promise resolving to the project name
 */
async function getProjectName(args: string[]): Promise<string> {
  const projectNameArg = args[0];

  // If project name was provided as argument and is valid, use it
  if (projectNameArg && PROJECT_NAME_REGEX.test(projectNameArg)) {
    return projectNameArg;
  }

  // Otherwise, prompt for it with default value
  const projectName = await clack.text({
    message: 'Project name:',
    placeholder: DEFAULT_PROJECT_NAME,
    initialValue: DEFAULT_PROJECT_NAME,
    validate: validateProjectName,
  });

  if (clack.isCancel(projectName)) {
    clack.cancel('Operation cancelled');
    process.exit(0);
  }

  // Trim and normalize the project name
  return projectName.trim();
}

/**
 * Handles existing directory by prompting user to overwrite if not empty
 * @param targetDir - The target directory path
 * @param projectName - The project name
 * @returns Promise that resolves when directory is ready
 */
async function handleExistingDirectory(
  targetDir: string,
  projectName: string,
): Promise<void> {
  if (!existsSync(targetDir)) {
    return;
  }

  const dirContents = readdirSync(targetDir);
  const isEmpty = dirContents.length === 0;

  if (isEmpty) {
    return;
  }

  const shouldOverwrite = await clack.confirm({
    message: `Directory "${projectName}" already exists and is not empty. Overwrite it?`,
    initialValue: false,
  });

  if (clack.isCancel(shouldOverwrite) || !shouldOverwrite) {
    clack.cancel('Operation cancelled');
    process.exit(0);
  }

  rmSync(targetDir, { recursive: true, force: true });
}

/**
 * Generates the next steps message based on project type
 * @param projectType - The type of project created
 * @param projectName - The project name
 * @param targetDir - The target directory path
 * @returns Formatted message with next steps
 */
function getNextStepsMessage(
  projectType: string,
  projectName: string,
  targetDir: string,
): string {
  const projectTypeLabel =
    projectType === TEMPLATE_TYPES.MONOREPO ? 'monorepo' : 'backend';

  const nextSteps =
    projectType === TEMPLATE_TYPES.MONOREPO
      ? `  cd ${projectName}
  bun run dev:backend  # Start backend on http://localhost:${PORTS.BACKEND}
  bun run dev:frontend # Start frontend on http://localhost:${PORTS.FRONTEND}`
      : `  cd ${projectName}
  bun run dev          # Start backend on http://localhost:${PORTS.BACKEND}`;

  return `
✨ Success! Your ElysiaJS ${projectTypeLabel} project is ready.

📁 Project created at: ${targetDir}

🚀 Next steps:
${nextSteps}

📚 Check out the README.md for more information.

Happy coding! 🎉
    `;
}

async function main() {
  console.clear();

  clack.intro('create-ely');

  // Check if project name was passed as argument
  const args = process.argv.slice(2);

  // Step 1: Select project type
  const projectType = await clack.select({
    message: 'What would you like to create?',
    options: [
      {
        value: TEMPLATE_TYPES.BACKEND,
        label: 'Backend only',
        hint: 'ElysiaJS API with PostgreSQL',
      },
      {
        value: TEMPLATE_TYPES.MONOREPO,
        label: 'Monorepo',
        hint: 'Backend + Frontend (React + TanStack Router)',
      },
    ],
  });

  if (clack.isCancel(projectType)) {
    clack.cancel('Operation cancelled');
    process.exit(0);
  }

  // Step 2: Get project name
  const projectName = await getProjectName(args);
  const targetDir = join(process.cwd(), projectName);

  // Step 3: Check if directory exists and handle it
  await handleExistingDirectory(targetDir, projectName);

  try {
    // Step 4: Setup template
    await setupTemplate(projectType, targetDir);

    // Step 5: Initialize git
    await initializeGit(targetDir);

    // Step 6: Show success message
    clack.outro(getNextStepsMessage(projectType, projectName, targetDir));
  } catch (error) {
    clack.cancel(
      error instanceof Error ? error.message : 'Unknown error occurred',
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
