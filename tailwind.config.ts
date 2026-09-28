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
          // The EXACT sampled pixels of public/navodaya-logo.png, which is a strict two-colour
          // mark: navy #00559A and cyan #00BCFF are the only hues present, everything else in
          // the file is anti-aliasing blend between them. (The former #085898 / #08B8F8 were
          // near-misses.) The surface restriction is load-bearing and unchanged: blue is 7.27:1
          // on paper (AAA) but 2.59:1 on ink, cyan is 9.03:1 on ink but 2.09:1 on paper.
          // Using either on the wrong ground is an accessibility failure.
          blue: '#00559A', // LIGHT surfaces only
          cyan: '#00BCFF', // DARK surfaces only
        },
        ink: '#060C10',
        paper: '#F9FAFC',
        // Luminance-matched COOL recast: every step below holds its predecessor's relative
        // luminance constant and rotates the hue to the logo navy's 206deg, which is why the
        // whole documented contrast table survives to within 0.03. The ramp was warm (R > G > B,
        // a sepia cast) and read as off-logo on a cool blue mark.
        // Do NOT "tidy" these back to neutral greys — the contrast pins below depend on the
        // matched luminance, not on the hue:
        //   grey-500 on paper 5.14 | grey-400 on ink 5.64 | grey-600 on paper 7.89
        // grey-500 is LIGHT-surfaces-only; grey-400 is the floor on ink (see ContactSection).
        grey: {
          50: '#F3F5F7',
          100: '#E4E8EC',
          200: '#CFD5D9',
          300: '#A8B1B8',
          400: '#7F8B94',
          500: '#616C75',
          600: '#475056',
          700: '#333B41',
          800: '#20272C',
          900: '#13191D',
        },
        // Three steps along the logo's own navy -> cyan axis, replacing an electric blue, a rust
        // orange and a forest green that appeared nowhere in the logo or the brand. `hotel` is
        // the exact logo navy. Used as 2px identifier rules on light card surfaces; worst
        // light-surface ratio is 3.28 (spa on grey-50), clearing WCAG 1.4.11's 3:1 non-text bar.
        // Mutual separation is 1.72 / 2.11 / 3.63 so the three stay tellable apart.
        category: {
          hygiene: '#00325C', // 12.48 on paper | 11.93 on grey-50 | 1.51 on ink
          hotel: '#00559A', // 7.27 on paper | 6.95 on grey-50 | 2.59 on ink — the logo navy
          spa: '#008FD1', // 3.44 on paper | 3.28 on grey-50 | 5.48 on ink
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
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(32px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
      },
    },
  },
  plugins: [],
} satisfies Config;
