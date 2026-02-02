/* eslint-env node */
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 'off', // Too many false positives in existing code
    '@typescript-eslint/ban-types': 'off', // Existing code issues
    'no-debugger': 'off', // Existing code has debugger statements
    'no-undef': 'off'
  },
  ignorePatterns: [
    '**/*.d.ts',
    '**/*.js',
    'dist',
    'node_modules'
  ]
}
