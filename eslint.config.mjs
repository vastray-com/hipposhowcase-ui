// eslint.config.mjs
import antfu from '@antfu/eslint-config'

export default antfu({
  formatters: {
    css: true,
    html: true,
  },
  unocss: true,
  react: true,
  typescript: {
    tsconfigPath: 'tsconfig.json',
  },
  ignores: ['!.*', '!**/.*/**', '**/node_modules', 'src/utils/recorder.ts', '*.lock', 'env/**', 'dist/**', 'src/components/animation/**'],
}, {
  rules: {
    'antfu/if-newline': 'off',
    'antfu/top-level-function': 'off',
    'curly': 'off',
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'unused-imports/no-unused-vars': 'off',
    'ts/no-unsafe-return': 'off',
    'ts/no-unsafe-assignment': 'off',
    'ts/strict-boolean-expressions': 'off',
    'ts/no-floating-promises': 'off',
    'react/no-array-index-key': 'off',
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
    // 'react-refresh/only-export-components': 'off',
    // 'style/arrow-parens': ['error', 'always'],
    // 'style/comma-dangle': ['error', 'always-multiline'],
    // 'style/jsx-closing-tag-location': 'off',
    // 'style/semi': ['error', 'always'],
    'ts/consistent-type-definitions': 'off',
    'ts/no-misused-promises': 'off',
    // 'ts/no-use-before-define': 'off',
    // 'regexp/no-super-linear-backtracking': 'off',
    // 'react/prefer-destructuring-assignment': 'off',
  },
})
