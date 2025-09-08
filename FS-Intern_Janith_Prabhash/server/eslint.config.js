import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  // Global ignore rules (flat config ignores .eslintignore by default)
  {
    ignores: ['dist/**', 'node_modules/**', 'prisma/**', '**/prisma/**'],
  },
  js.configs.recommended,
  // Light TypeScript linting for .ts/.tsx files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly' },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  'no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
  // Test files: relax unused vars completely
  {
    files: ['test/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
  'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly' },
    },
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['prisma/seed.js'],
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
    },
  },
];
