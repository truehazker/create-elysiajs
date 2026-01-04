# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.5] - 2026-01-04

### Fixed

- Fixed demo video not being displayed in the README.md on npmjs page

### Changed

- Changed file type of the video from .mp4 to .gif

## [0.1.4] - 2026-01-04

### Fixed

- Fixed templates not being extracted when using `bunx create-ely` due to Bun's default-secure lifecycle scripts policy
- Added runtime template extraction to ensure templates are available regardless of postinstall execution

## [0.1.3] - 2026-01-04

### Added

- Added scripts for creating and extracting `templates.zip` archive (to preserve .gitignore files) in the published package

### Changed

- Refactored codebase for better maintainability and organization
- Extracted `copyRecursive` and validation logic into `src/utils.ts`
- Extracted git initialization logic into `src/git.ts`
- Extracted template setup logic into `src/template.ts`
- Centralized constants and configuration into `src/constants.ts`
- Reduced main function complexity from 296 to 60 lines
- Added JSDoc comments to all exported functions
- Improved code reusability and testability

## [0.1.2] - 2026-01-03

### Added

- Added validation to the project name prompt
- Added git init option to the CLI

## [0.1.1] - 2026-01-03

### Changed

- Renamed project to `create-ely`

## [0.1.0] - 2026-01-03

### Added

- Initial CLI tool for scaffolding ElysiaJS projects
- Backend template as a submodule
- Frontend template with React and TanStack Router
- Monorepo template structure
- GitHub Actions workflows for linting and publishing
- Contributing guidelines
- Project documentation
