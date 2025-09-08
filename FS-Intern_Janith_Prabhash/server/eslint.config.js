import js from '@eslint/js';

export default [
  // Global ignore rules (flat config ignores .eslintignore by default)
  {
    ignores: ['dist/**', 'node_modules/**', 'prisma/**/*.js', '**/prisma/**/*.js'],
  },
  js.configs.recommended,
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
