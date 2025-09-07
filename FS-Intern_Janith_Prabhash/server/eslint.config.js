import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
  ignores: ['dist/**', 'node_modules/**', 'prisma/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { process: 'readonly', console: 'readonly' },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
