# Contributing to chem-generic-ui

Thanks for your interest in contributing. This document explains how to set up the project, propose changes, and submit pull requests.

## Code of Conduct

This project follows the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Prerequisites

- Node.js `>=21.0.0 <25.0.0` (see [package.json](package.json))
- Yarn (a `yarn.lock` is committed; please use Yarn for dependency installs)
- Git

## Getting Started

```bash
git clone https://github.com/LabIMotion/chem-generic-ui.git
cd chem-generic-ui
yarn install
```

## Common Scripts

| Script | Purpose |
|--------|---------|
| `yarn build` | Production build via Vite |
| `yarn build:d` | Development build |
| `yarn test` | Run Vitest suite once (verbose) |
| `yarn test:watch` | Run Vitest in watch mode |

## Branching

- Base your work on the active development branch (currently `main`).
- Use a descriptive branch name, e.g. `feat/short-description`, `fix/short-description`, `chore/short-description`.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>
```

Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `build`, `ci`.

Keep the subject under ~72 characters. Use the body to explain *why* when not obvious.

## Coding Standards

- Lint with the project ESLint config (`eslint.config.js`).
- Format with Prettier; respect existing style.
- Do not commit generated `dist/` artifacts in feature PRs unless the change is a release.
- Keep changes focused — avoid mixing refactors with feature work.

## Tests

- Add or update Vitest tests for any behavior change.
- Run `yarn test` before opening a PR; all tests must pass.

## Pull Requests

1. Fork the repo and push your branch.
2. Open a PR against the active development branch.
3. Fill in the PR description: motivation, summary of changes, screenshots for UI changes, and a test plan.
4. Link related issues (`Fixes #123`).
5. Address review feedback with new commits; squash on merge if requested by maintainers.

A PR is ready when:

- [ ] Tests pass locally (`yarn test`)
- [ ] Lint is clean
- [ ] No unrelated changes
- [ ] Docs updated

## Reporting Bugs

Open a GitHub issue with:

- chem-generic-ui version
- Node version, OS, browser
- Reproduction steps and expected vs. actual behavior
- Minimal repro or code snippet when possible

## Feature Requests

Open an issue describing the use case and proposed API. Discuss before implementing large changes.

## License

By contributing, you agree your contributions are licensed under the project's [AGPL-3.0 License](LICENSE).
