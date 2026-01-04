#!/usr/bin/env bun
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import AdmZip from 'adm-zip';

/**
 * Prepare script that runs before publishing
 * Zips the templates folder to preserve .gitignore files
 * See: https://johnnyreilly.com/smuggling-gitignore-npmrc-in-npm-packages
 */
const templatesPath = join(import.meta.dir, '..', 'templates');
const zipPath = join(import.meta.dir, '..', 'templates.zip');

// Templates folder must exist
if (!existsSync(templatesPath)) {
  console.error('ERROR: templates folder not found. Cannot create archive.');
  process.exit(1);
}

try {
  // Remove existing zip if it exists
  if (existsSync(zipPath)) {
    unlinkSync(zipPath);
  }

  // Create zip archive
  const zip = new AdmZip();
  zip.addLocalFolder(templatesPath);
  zip.writeZip(zipPath);

  if (!existsSync(zipPath)) {
    throw new Error('templates.zip was not created');
  }

  console.log('✓ templates.zip created successfully');
} catch (error) {
  console.error(
    'ERROR: Failed to create templates.zip:',
    error instanceof Error ? error.message : error,
  );
  process.exit(1);
}
