/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        instagram: {
          orange: '#f09433',
          red: '#e6683c',
          pink: '#dc2743',
          purple: '#cc2366',
          violet: '#bc1888',
          blue: '#0095f6',
          like: '#ff3040'
        },
        dark: {
          primary: '#000000',
          secondary: '#121212',
          card: '#262626',
          border: '#262626'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif']
      },
      backgroundImage: {
        'instagram-gradient': 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      }
    },
  },
  plugins: [],
}
