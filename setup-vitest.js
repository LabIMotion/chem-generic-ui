import '@testing-library/jest-dom';

// Backward-compat shim: existing test files use `jest.fn()`, `jest.mock()`, etc.
// Vitest exposes the same API under `vi` — we alias `jest` so no test file edits are needed.
// eslint-disable-next-line no-undef
globalThis.jest = vi;
