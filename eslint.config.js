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
    ],
  },
];
