import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import-x'
import prettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(

  // ─── Fichiers ignorés ─────────────────────────────────────────────────────
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/generated/**', 'eslint.config.ts','**/vite.config.ts'],
  },


  // ─── Base JS ──────────────────────────────────────────────────────────────
  js.configs.recommended,


  // ─── TypeScript avec type-checking (exclut les fichiers de config) ────────
  {
    files: ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'import-x': importPlugin,
    },
    rules: {

      // ── Naming conventions ────────────────────────────────────────────────
      '@typescript-eslint/naming-convention': [
          'error',

          // variables + paramètres → camelCase
          {
            selector: ['variable', 'parameter'],
            format: ['camelCase'],
            leadingUnderscore: 'allow',
          },

          // fonctions → camelCase + PascalCase (React components)
          {
            selector: 'function',
            format: ['camelCase', 'PascalCase'],
          },

          // types → PascalCase
          {
            selector: ['class', 'interface', 'typeAlias', 'enum'],
            format: ['PascalCase'],
          },

          // constantes
          {
            selector: 'variable',
            modifiers: ['const'],
            format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          },

          // enum members
          {
            selector: 'enumMember',
            format: ['PascalCase', 'UPPER_CASE'],
          },
      ],

      // ── TypeScript ────────────────────────────────────────────────────────
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // ── Imports ───────────────────────────────────────────────────────────
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc' },
        },
    ],
    'import-x/no-duplicates': 'error',
    'no-multiple-empty-lines': ['error', { max: 4, maxEOF: 1 }],
    // max: 2 → autorise jusqu'à 2 lignes vides consécutives
    // maxEOF: 1 → max 1 ligne vide en fin de fichier
},
  },

  // ─── TypeScript sans type-checking (fichiers de config) ───────────────────
  {
    files: ['*.config.ts', 'apps/*/vite.config.ts'],
    extends: [...tseslint.configs.recommended],
  },

  // ─── Règles React (frontend uniquement) ───────────────────────────────────
  {
    files: ['apps/frontend/**/*.tsx', 'apps/frontend/**/*.ts'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // ─── Prettier — TOUJOURS EN DERNIER ───────────────────────────────────────
  prettier,
)