const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const babelParser = require('@babel/eslint-parser');
const prettier = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const jest = require('eslint-plugin-jest');
const jestDom = require('eslint-plugin-jest-dom');
const importPlugin = require('eslint-plugin-import');
const jsxA11y = require('eslint-plugin-jsx-a11y');
const globals = require('globals');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  js.configs.recommended,
  ...compat.extends('airbnb'),
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
        // Tests run on Vitest: describe/test/expect/etc. overlap with the jest
        // globals above, but `vi` is Vitest-specific and otherwise reads as
        // no-undef. Runtime provides it via vite.config.js `test.globals: true`.
        vi: 'readonly',
      },
    },
    plugins: {
      import: importPlugin,
      react,
      prettier,
      jest,
      'jest-dom': jestDom,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
      },
      // Tests run on Vitest (jest-compatible globals), so the `jest` package
      // isn't installed. Pin a version so eslint-plugin-jest rules (e.g.
      // jest/no-deprecated-functions) don't fail trying to detect it.
      jest: {
        version: 27,
      },
      'import/resolver': {
        alias: {
          map: [
            ['@', './src'],
            ['@assets', './src/assets'],
            ['@components', './src/components'],
            ['@models', './src/models'],
            ['@schemas', './src/schemas'],
            ['@utils', './src/utils'],
            ['@ui', './src/ui'],
            ['@root', '.'],
          ],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      'max-len': [1, 100, 2, { ignoreComments: true }],
      'no-console': ['off'],
      'comma-dangle': [1, 'only-multiline'],
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'prettier/prettier': [
        'error',
        {
          arrowParens: 'always',
        },
      ],
      'prefer-destructuring': ['error', { object: true, array: false }],
      'jest-dom/prefer-checked': 'error',
      'jest-dom/prefer-enabled-disabled': 'error',
      'jest-dom/prefer-required': 'error',
      'jest-dom/prefer-to-have-attribute': 'error',
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jest.configs.recommended.rules,
      ...jestDom.configs.recommended.rules,
      // --- Relaxed: legacy or pure-taste rules with no bug-catching value. ---
      // PropTypes is a legacy runtime mechanism (removed in React 19); backfilling
      // ~400 hand-written shapes is throwaway work. Prefer TypeScript if a prop
      // contract is ever wanted.
      'react/prop-types': 'off',
      'react/require-default-props': 'off',
      'react/forbid-prop-types': 'off',
      // Stylistic only — these flag taste, not defects.
      'react/jsx-props-no-spreading': 'off',
      'react/destructuring-assignment': 'off',
      'no-nested-ternary': 'off',
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      // --- Kept ON intentionally (catch real bugs): ---
      // react/no-unstable-nested-components, react-hooks/exhaustive-deps,
      // no-param-reassign, no-restricted-globals, no-shadow, no-unused-vars.
    },
  },
  prettierConfig,
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'build/**',
      '*.config.js',
      // CI tooling (e.g. .github/scripts/lint-changed-lines.js), not the React
      // library source — the airbnb ruleset (no for-of/continue, React rules)
      // doesn't fit a plain Node script.
      '.github/**',
      // Yarn Berry vendored runtime (release binary, plugins, PnP loader) —
      // not our source; linting it produced bogus findings.
      '.yarn/**',
      '.pnp.*',
    ],
  },
];
