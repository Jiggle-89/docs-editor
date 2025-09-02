module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:cypress/recommended'
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh', "cypress"],
  overrides: [
    {
      // החל את החוקים הבאים רק על קבצים שמסתיימים ב-cjs
      files: ['**/*.cjs'],
      env: {
        // הכר במשתנים גלובליים של סביבת Node.js
        node: true,
      },
    },
    {
      // ===============================================
      // ===== הוספנו את הבלוק הזה עבור main.mjs =====
      // ===============================================
      // חוק לקבצי התהליך הראשי של אלקטרון
      files: ['main.mjs'], // ניתן להוסיף פה עוד קבצים אם יהיו בעתיד
      env: {
        // הכר במשתנים גלובליים של סביבת Node.js
        node: true,
      },
      // ===============================================
    }
  ],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
