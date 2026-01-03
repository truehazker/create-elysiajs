#!/usr/bin/env bun
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import * as clack from '@clack/prompts';

async function main() {
  console.clear();

  clack.intro('create-ely');

  // Check if project name was passed as argument
  const args = process.argv.slice(2);
  const projectNameArg = args[0];

  // Step 1: Select project type
  const projectType = await clack.select({
    message: 'What would you like to create?',
    options: [
      {
        value: 'backend',
        label: 'Backend only',
        hint: 'ElysiaJS API with PostgreSQL',
      },
      {
        value: 'monorepo',
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
  let projectName: string | symbol;

  // If project name was provided as argument and is valid, use it
  if (projectNameArg && /^[a-z0-9-]+$/.test(projectNameArg)) {
    projectName = projectNameArg;
  } else {
    // Otherwise, prompt for it with default value
    projectName = await clack.text({
      message: 'Project name:',
      placeholder: 'my-ely-app',
      initialValue: 'my-ely-app',
      validate: (value) => {
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
      },
    });

    if (clack.isCancel(projectName)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }

    // Trim and normalize the project name
    projectName = (projectName as string).trim();
  }

  const targetDir = join(process.cwd(), projectName as string);

  // Step 3: Check if directory exists and handle it
  if (existsSync(targetDir)) {
    const dirContents = readdirSync(targetDir);
    const isEmpty = dirContents.length === 0;

    if (!isEmpty) {
      const shouldOverwrite = await clack.confirm({
        message: `Directory "${String(projectName)}" already exists and is not empty. Overwrite it?`,
        initialValue: false,
      });

      if (clack.isCancel(shouldOverwrite) || !shouldOverwrite) {
        clack.cancel('Operation cancelled');
        process.exit(0);
      }

      rmSync(targetDir, { recursive: true, force: true });
    }
  }

  const spinner = clack.spinner();
  spinner.start('Creating project...');

  try {
    const templateDir = join(
      import.meta.dir,
      '..',
      'templates',
      projectType as string,
    );

    // Cross-platform recursive copy function
    function copyRecursive(src: string, dest: string, exclude: string[] = []) {
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

    copyRecursive(templateDir, targetDir, ['node_modules', '.git']);

    // Handle template files: copy them to their intended locations
    if (projectType === 'monorepo') {
      const backendBiomeTemplate = join(
        templateDir,
        'apps',
        'backend-biome.json.template',
      );
      const backendBiomeTarget = join(
        targetDir,
        'apps',
        'backend',
        'biome.json',
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

    // Step 4: Ask if user wants to initialize git
    const initGit = await clack.confirm({
      message: 'Initialize git repository?',
      initialValue: true,
    });

    if (clack.isCancel(initGit)) {
      clack.cancel('Operation cancelled');
      process.exit(0);
    }

    if (initGit) {
      // Check if git is available
      const gitCheckProc = Bun.spawn(['git', '--version'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });
      await gitCheckProc.exited;

      if (gitCheckProc.exitCode !== 0) {
        clack.log.warn(
          'Git is not installed or not available. Skipping git initialization.',
        );
      } else {
        const gitSpinner = clack.spinner();
        gitSpinner.start('Initializing git repository...');

        try {
          const gitInitProc = Bun.spawn(['git', 'init'], {
            cwd: targetDir,
            stdout: 'pipe',
            stderr: 'pipe',
          });
          await gitInitProc.exited;

          if (gitInitProc.exitCode === 0) {
            gitSpinner.stop('Git repository initialized');

            // Make initial commit
            gitSpinner.start('Creating initial commit...');

            const gitAddProc = Bun.spawn(['git', 'add', '.'], {
              cwd: targetDir,
              stdout: 'pipe',
              stderr: 'pipe',
            });
            await gitAddProc.exited;

            if (gitAddProc.exitCode === 0) {
              const gitCommitProc = Bun.spawn(
                ['git', 'commit', '-m', 'Initial commit'],
                {
                  cwd: targetDir,
                  stdout: 'pipe',
                  stderr: 'pipe',
                },
              );
              await gitCommitProc.exited;

              if (gitCommitProc.exitCode === 0) {
                gitSpinner.stop('Initial commit created');
              } else {
                gitSpinner.stop('Git initialized (commit failed)');
                clack.log.warn(
                  'Failed to create initial commit. You can commit manually later.',
                );
              }
            } else {
              gitSpinner.stop('Git initialized (add failed)');
              clack.log.warn(
                'Failed to stage files. You can add them manually later.',
              );
            }
          } else {
            gitSpinner.stop('Failed to initialize git');
            clack.log.warn(
              'Git initialization failed. You can initialize manually later.',
            );
          }
        } catch {
          gitSpinner.stop('Git initialization failed');
          clack.log.warn(
            'An error occurred during git initialization. You can initialize manually later.',
          );
        }
      }
    }

    // Prepare next steps message
    const projectTypeLabel =
      projectType === 'monorepo' ? 'monorepo' : 'backend';
    const nextSteps =
      projectType === 'monorepo'
        ? `  cd ${String(projectName)}
  bun run dev:backend  # Start backend on http://localhost:3000
  bun run dev:frontend # Start frontend on http://localhost:5173`
        : `  cd ${String(projectName)}
  bun run dev          # Start backend on http://localhost:3000`;

    clack.outro(`
✨ Success! Your ElysiaJS ${projectTypeLabel} project is ready.

📁 Project created at: ${targetDir}

🚀 Next steps:
${nextSteps}

📚 Check out the README.md for more information.

Happy coding! 🎉
    `);
  } catch (error) {
    spinner.stop('Failed to create project');
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
