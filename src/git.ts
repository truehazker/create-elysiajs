import * as clack from '@clack/prompts';

/**
 * Initializes a git repository in the target directory and creates an initial commit
 * @param targetDir - The directory to initialize git in
 * @returns Promise that resolves when git initialization is complete
 */
export async function initializeGit(targetDir: string): Promise<void> {
  const initGit = await clack.confirm({
    message: 'Initialize git repository?',
    initialValue: true,
  });

  if (clack.isCancel(initGit)) {
    clack.cancel('Operation cancelled');
    process.exit(0);
  }

  if (!initGit) {
    return;
  }

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
    return;
  }

  const gitSpinner = clack.spinner();
  gitSpinner.start('Initializing git repository...');

  try {
    const gitInitProc = Bun.spawn(['git', 'init'], {
      cwd: targetDir,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await gitInitProc.exited;

    if (gitInitProc.exitCode !== 0) {
      gitSpinner.stop('Failed to initialize git');
      clack.log.warn(
        'Git initialization failed. You can initialize manually later.',
      );
      return;
    }

    gitSpinner.stop('Git repository initialized');

    // Make initial commit
    gitSpinner.start('Creating initial commit...');

    const gitAddProc = Bun.spawn(['git', 'add', '.'], {
      cwd: targetDir,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await gitAddProc.exited;

    if (gitAddProc.exitCode !== 0) {
      gitSpinner.stop('Git initialized (add failed)');
      clack.log.warn('Failed to stage files. You can add them manually later.');
      return;
    }

    const gitCommitProc = Bun.spawn(['git', 'commit', '-m', 'Initial commit'], {
      cwd: targetDir,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    await gitCommitProc.exited;

    if (gitCommitProc.exitCode === 0) {
      gitSpinner.stop('Initial commit created');
    } else {
      gitSpinner.stop('Git initialized (commit failed)');
      clack.log.warn(
        'Failed to create initial commit. You can commit manually later.',
      );
    }
  } catch {
    gitSpinner.stop('Git initialization failed');
    clack.log.warn(
      'An error occurred during git initialization. You can initialize manually later.',
    );
  }
}
