module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint', 'import'],

  overrides: [
    {
      files: ['*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],

  rules: {
    'no-fallthrough': 'error',
    'no-unused-expressions': 'off',
    'padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['if', 'for', 'while', 'switch', 'return', 'try'],
      },
      {
        blankLine: 'always',
        prev: ['if', 'for', 'while', 'switch', 'return', 'try'],
        next: '*',
      },
    ],

    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],

    'import/no-duplicates': 'error',
  },
};
