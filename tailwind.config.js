/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f8f7f2',
          100: '#f0eee4',
          200: '#e4e0d6',
          300: '#d0cabb',
          400: '#a9a99c',
          500: '#82908c',
          600: '#5c6b6b',
          700: '#3d4d4f',
          800: '#263638',
          900: '#1c2b2d',
          950: '#10191b',
        },
        success: {
          50: '#e7f0e9',
          100: '#d3e6d9',
          500: '#3f8a63',
          600: '#2f6f4f',
          700: '#235940',
        },
        danger: {
          50: '#f7e9e5',
          100: '#f0d4cc',
          500: '#d1704f',
          600: '#c65b45',
          700: '#a84a37',
        },
        gold: {
          50: '#f5eedc',
          100: '#ecdfbe',
          500: '#cba54a',
          600: '#b8923a',
          700: '#96762c',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(28,43,45,0.04), 0 8px 24px rgba(28,43,45,0.06)',
      }
    },
  },
  plugins: [],
}
