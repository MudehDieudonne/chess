/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  // @ts-ignore
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        jost: ['Jost', 'san-serif'],
        'jost-medium': ['Jost-Medium', 'sans-serif'],
        'jost-bold': ['Jost-Bold', 'sans-serif']
      },
      colors: {
        primary: '#3763B0',
        secondary: '#E6A276',
        success: '#008659',
        error: '#F62121',
        black: '#18191A',
        white: '#FAFCFE',
        text: '#A7A7A7'
      }
    }
  },
  plugins: []
};