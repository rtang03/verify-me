module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    // Uncomment the following lines to enable eslint-config-prettier
    // Is not enabled right now to avoid issues with the Next.js repo
    // "prettier",
    // "prettier/@typescript-eslint",
    // 'eslint-plugin-prettier',
  ],
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true,
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['**/dist/*.js', 'sidecar/**/*.js', 'graphql/**/*.tsx'],
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 0,
    'react/react-in-jsx-scope': 0,
    'react/display-name': 0,
    'react/prop-types': 0,
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/explicit-member-accessibility': 0,
    '@typescript-eslint/indent': 0,
    '@typescript-eslint/member-delimiter-style': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-var-requires': 0,
    '@typescript-eslint/no-use-before-define': 0,
    '@typescript-eslint/no-unused-vars': [
      0,
      {
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/member-ordering': 'off',
    'import/order': ['error', { alphabetize: { order: 'asc' } }],
  },
};
