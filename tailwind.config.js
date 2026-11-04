/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.tsx', './components/**/*.tsx', './services/**/*.ts'],
  theme: { extend: { fontFamily: { sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'] } } },
  plugins: [],
};
