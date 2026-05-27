import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Global ignores — folders that should never be linted
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'references/**',
    'dev-tools/**',
    'e2e/**',
    'playwright-report/**',
    'test-results/**',
    'coverage/**',
    '*.config.mts',
    '*.config.ts',
    '*.config.js',
  ]),

  // Test files — relax strict rules (mocks use `any`, unused vars in destructuring)
  {
    files: ['src/__tests__/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@next/next/no-img-element': 'off',
      'jsx-a11y/alt-text': 'off',
    },
  },

  // Source files — allow setState in useEffect (valid pattern for client-only initialization)
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // setState in useEffect is valid for client-only initialization (isMobile, sessionStorage checks)
      'react-hooks/set-state-in-effect': 'off',
      // Ref mutations inside callbacks are valid (canvas physics loop mutates node objects via ref)
      'react-hooks/immutability': 'off',
      // Allow prefer-const to be a warning not error
      'prefer-const': 'warn',
    },
  },
]);

export default eslintConfig;
