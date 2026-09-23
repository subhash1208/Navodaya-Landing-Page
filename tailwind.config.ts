import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1152px',
      },
    },
    extend: {
      colors: {
        brand: {
          primary: '#1E40AF',
          secondary: '#0EA5E9',
          accent: '#F59E0B',
          dark: '#0F172A',
          light: '#F0F9FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        ink: '#0A0B0D',
        paper: '#FAFAF8',
        grey: {
          50: '#F5F5F3',
          100: '#E8E8E5',
          200: '#D4D4D0',
          300: '#B0B0AA',
          400: '#8A8A83',
          500: '#6B6B64',
          600: '#4F4F49',
          700: '#3A3A35',
          800: '#262623',
          900: '#181816',
        },
        category: {
          hygiene: '#1B4DFF',
          hotel: '#B8561E',
          spa: '#2E7D5B',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-1': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.92', letterSpacing: '-0.03em' }],
        'display-2': [
          'clamp(2.25rem, 5vw, 4rem)',
          { lineHeight: '0.98', letterSpacing: '-0.025em' },
        ],
        // Reproduces the hero headline's pre-SEALED ramp exactly. `display-2` is 25% larger at
        // 1280px and wraps the constrained hero column to six lines — see fix 1 in the Wave 2
        // review. Keep this token whenever a headline must not grow.
        'display-3': [
          'clamp(2rem, 4vw, 3.75rem)',
          { lineHeight: '1.05', letterSpacing: '-0.02em' },
        ],
        'heading-1': [
          'clamp(1.75rem, 3vw, 2.5rem)',
          { lineHeight: '1.1', letterSpacing: '-0.02em' },
        ],
        'heading-2': ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0' }],
        body: ['1rem', { lineHeight: '1.65', letterSpacing: '0' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        data: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        label: ['0.6875rem', { lineHeight: '1.3', letterSpacing: '0.12em' }],
      },
      boxShadow: {
        e0: 'none',
        e1: '1px 1px 2px -1px rgb(10 11 13 / 0.06), 1px 2px 4px 0 rgb(10 11 13 / 0.04)',
        e2: '2px 2px 4px -2px rgb(10 11 13 / 0.07), 2px 4px 8px -1px rgb(10 11 13 / 0.05)',
        e3: '3px 4px 8px -4px rgb(10 11 13 / 0.08), 4px 8px 16px -2px rgb(10 11 13 / 0.06)',
        e4: '4px 8px 16px -8px rgb(10 11 13 / 0.10), 8px 16px 32px -4px rgb(10 11 13 / 0.07)',
        e5: '8px 16px 32px -12px rgb(10 11 13 / 0.12), 16px 32px 64px -8px rgb(10 11 13 / 0.08)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        gradientSweep: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 9s ease-in-out infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'gradient-sweep': 'gradientSweep 0.8s ease forwards',
        'gradient-shift': 'gradientShift 3s ease infinite',
        aurora: 'aurora 60s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
