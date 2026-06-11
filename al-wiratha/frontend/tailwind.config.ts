import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F4C3A',
          50: '#E8F2EF',
          100: '#C5DFD8',
          200: '#9ECBBF',
          300: '#77B7A6',
          400: '#50A38D',
          500: '#0F4C3A',
          600: '#0C3D2E',
          700: '#092D22',
          800: '#061E16',
          900: '#030F0B',
        },
        secondary: {
          DEFAULT: '#C9A227',
          50: '#FBF5E0',
          100: '#F5E7B3',
          200: '#EFD886',
          300: '#E9CA59',
          400: '#E3BB2C',
          500: '#C9A227',
          600: '#A1821F',
          700: '#796117',
          800: '#51410F',
          900: '#292007',
        },
        background: '#FAF8F4',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-ibm-plex-arabic)', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
        quran: ['Amiri', 'serif'],
      },
      backgroundImage: {
        'islamic-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230F4C3A' fill-opacity='0.03'%3E%3Cpath d='M30 0l7.5 13h15L45 26l7.5 13H37.5L30 52l-7.5-13H7.5L15 26 7.5 13h15z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
