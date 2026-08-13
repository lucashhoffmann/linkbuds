import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: { '0%': { opacity: '1' }, '100%': { opacity: '0' } },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        smoothContent: {
          from: { opacity: '0', marginTop: '-24px' },
          to: { opacity: '1', marginTop: '0px' },
        },
        up: {
          '0%': { opacity: '0', transform: 'translateY(0.5rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        down: {
          from: { opacity: '0', transform: 'translateY(-0.5rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        left: {
          from: { opacity: '0', transform: 'translateX(0.5rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        right: {
          from: { opacity: '0', transform: 'translateX(-0.5rem)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeIn: 'fadeIn 0.2s ease-out',
        fadeOut: 'fadeOut 0.2s ease-in',
        smoothContent: 'smoothContent 0.18s ease-out forwards',
        up: 'up 0.24s ease-out',
        down: 'down 0.2s ease-out forwards',
        left: 'left 0.2s ease-out forwards',
        right: 'right 0.2s ease-out forwards',
        spin: 'spin 1s linear infinite',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
