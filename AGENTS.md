# Coding Patterns for AI Agents

This document outlines coding patterns and conventions for AI agents working on this codebase. Patterns are added as they are observed and corrected.

## Type Safety

### Never use `any` type

- **NEVER use `any`** - It disables TypeScript's type checking
- **Prefer strict, specific types** - Define proper interfaces and types first
- **Use `unknown` as last resort** - Only when type is truly unknown

## Code Organization

### Extract utility functions to separate files

- Each utility function should be in its own file
- File names should be kebab-case matching the function name
- Example: `getIssuesForError` → `get-issues-for-error.ts`

## Naming Conventions

### Use descriptive function names

- Function names should clearly describe what they do
- Prefer verbose over terse: `setValueAtPath` over `setPath`
- Use explicit input/output naming: `flatObjectToNestedObject` over `flatToNestedObject`
- The function name should show what goes in and what comes out
- Use consistent naming patterns across related functions
- Example: `stringPathToArrayPath` / `arrayPathToStringPath`
- Example: `flatObjectToNestedObject` / `nestedObjectToFlatObject`

### Use `Number.isNaN()` instead of `isNaN()`

- `isNaN()` coerces values which can lead to unexpected results
- Use `Number.isNaN()` for safer type checking

## Release Management

### Updating CHANGELOG.md files

- **ALWAYS use `## Unreleased` as the header** for pending changes
- Do NOT use version numbers like `## v0.1.0 (TBD)` or `## 0.1.0 - TBD`
- The `tag-release.js` script automatically replaces `## Unreleased` with `## v{version} ({date})`
- Format:
  ```markdown
  # `package-name` CHANGELOG

  This is the changelog for [`package-name`](https://github.com/typed-web/typed-web/tree/main/packages/package-name). It follows [semantic versioning](https://semver.org/).

  ## Unreleased

  - Change 1
  - Change 2

  ## v0.1.0 (2025-01-27)

  - Previous change
  ```
- List changes as bullet points (no subsections like `### Added`)
- When tagging a release, run: `pnpm tag-release <packageName> <releaseType>`
- Release types: `major`, `minor`, `patch`

---

**Note:** When an AI agent is corrected, it should add the pattern to this file automatically. Keep additions concise.
