/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mistri: {
          blue: '#263A8B',
          'blue-dark': '#1a275e',
          amber: '#F59E0B',
          bg: '#F8FAFC',
          success: '#16A34A',
        },
      },
    },
  },
  plugins: [],
};
