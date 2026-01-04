#!/usr/bin/env bun
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import AdmZip from 'adm-zip';

/**
 * Postinstall script that runs after package installation
 * Unzips the templates folder to restore .gitignore files
 * See: https://johnnyreilly.com/smuggling-gitignore-npmrc-in-npm-packages
 */
const templatesPath = join(import.meta.dir, '..', 'templates');
const zipPath = join(import.meta.dir, '..', 'templates.zip');

// Skip if templates folder already exists (source repo or already extracted)
if (existsSync(templatesPath)) {
  process.exit(0);
}

// Zip file must exist in installed package
if (!existsSync(zipPath)) {
  console.error(
    'ERROR: templates.zip not found. Installation may be corrupted.',
  );
  process.exit(1);
}

try {
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(templatesPath, true);

  if (!existsSync(templatesPath)) {
    throw new Error('Templates folder was not created after extraction');
  }
} catch (error) {
  console.error(
    'ERROR: Failed to extract templates:',
    error instanceof Error ? error.message : error,
  );
  console.error(
    'Report this issue: https://github.com/truehazker/create-ely/issues',
  );
  process.exit(1);
}
