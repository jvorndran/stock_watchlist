/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.js', './src/**/*.html'],
  theme: {
    extend: {

      fontFamily: {
        sans: ['Helvetica', 'sans-serif'],
      },
      colors: {
        'black-steel': '#262626',
        'cust-brown': '#543729',
        'cust-tan': '#876E61',
        'cust-dark-brown': '#4E4139',
        'cust-grey': '#8B8C8E'
      },
    },
  },
  plugins: [],
}


