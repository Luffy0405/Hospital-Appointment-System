/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clinical: {
          50: '#f0f9f8',
          100: '#dbf0ee',
          200: '#b8e1dd',
          300: '#8bcac4',
          400: '#57aaa3',
          500: '#3b8d86',
          600: '#2e716c',
          700: '#295c58',
          800: '#254a48',
          900: '#213f3d',
        },
        alert: {
          500: '#d9704f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
