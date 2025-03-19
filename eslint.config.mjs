import globals from "globals";
import js from '@eslint/js'
import stylisticJs from '@stylistic/eslint-plugin-js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs .recommended,
  {
    plugins: {
    '@stylistic/js': stylisticJs,    
    },
    rules: { 
      '@stylistic/js/indent': ['error', 4],
      '@stylistic/js/linebreak-style': ['error', 'unix'],
      '@stylistic/js/quotes': ['error', 'single'],
      '@stylistic/js/semi': ['error', 'never'],
    }, 
    files: ["**/*.js"],
    languageOptions: { sourceType: "commonjs" }
  },
  {
    languageOptions: { globals: globals.node }
  },
  {
    ignores: ['dist/**'],
  },
];
