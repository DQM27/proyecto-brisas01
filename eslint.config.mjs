// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Ignorar carpetas y archivos generados automáticamente
  {
    ignores: ['dist', 'node_modules', 'eslint.config.mjs'],
  },

  // Configuraciones recomendadas por ESLint y TypeScript
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  // Integración con Prettier (mantiene compatibilidad y evita conflictos)
  eslintPluginPrettierRecommended,

  // ⚙️ Configuración de lenguaje y parser
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        // Esta línea soluciona el típico error de parser con NestJS
        project: ['./tsconfig.json'],
      },
      sourceType: 'module',
    },
  },

  // ⚖️ Reglas personalizadas
  {
    rules: {
      // 👇 Desactivar reglas que chocan con NestJS o decorators
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',

      // 👇 Hacer que Prettier maneje el formato
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto', // evita errores de saltos de línea entre SOs
          singleQuote: true,
          trailingComma: 'all',
          semi: true,
          printWidth: 100,
        },
      ],
    },
  },
);
