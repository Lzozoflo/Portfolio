import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import-x'
import prettier from 'eslint-plugin-prettier/recommended'

export default tseslint.config(
  
  // ─── Base JS ──────────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript ───────────────────────────────────────────────────────────
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.config.ts', 'eslint.config.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // ─── Règles communes back + front ─────────────────────────────────────────
  {
    files: ['apps/**/*.ts', 'apps/**/*.tsx', 'packages/**/*.ts'],
    plugins: {
      'import-x': importPlugin,
    },
    rules: {
      // ── Naming conventions (selon NAMING_CONVENTION.md) ──────────────────
      '@typescript-eslint/naming-convention': [
        'error',
        // camelCase — variables et fonctions
        {
          selector: ['variable', 'function', 'parameter'],
          format: ['camelCase'],
          leadingUnderscore: 'allow', // _unused autorisé
        },
        // PascalCase — classes, interfaces, types, enums
        {
          selector: ['class', 'interface', 'typeAlias', 'enum'],
          format: ['PascalCase'],
        },
        // UPPER_SNAKE_CASE — constantes
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          // camelCase aussi autorisé pour les const non-primitives (ex: const userService = new UserService())
        },
        // PascalCase — membres d'enum
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
    },
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
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // React 17+ — import automatique
      'react/prop-types': 'off',         // remplacé par TypeScript
    },
  },

  // ─── Prettier — TOUJOURS EN DERNIER ───────────────────────────────────────
  prettier,
)