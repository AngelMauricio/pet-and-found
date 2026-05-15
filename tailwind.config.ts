import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./messages/**/*.json"
  ],
  theme: {
    extend: {
      colors: {
        'off-white': '#f4f4f4',
        'sand': {
          50: '#fdf8f1',
          100: '#fbf0e1',
          200: '#f6e0c2',
          300: '#f1d1a2',
          400: '#eccca2', // Base
          500: '#d9a668',
          600: '#c2844d',
          700: '#a1663d',
          800: '#825235',
          900: '#6b432d',
        },
        'brand': {
          'primary': '#333333',
          'secondary': '#666666',
          'muted': '#999999',
        }
      },
    },
  },
  plugins: [],
};
export default config;