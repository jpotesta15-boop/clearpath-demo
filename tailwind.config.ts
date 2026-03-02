import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BRAND_PRIMARY) ? process.env.NEXT_PUBLIC_BRAND_PRIMARY : '#0284c7',
          700: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BRAND_SECONDARY) ? process.env.NEXT_PUBLIC_BRAND_SECONDARY : '#0369a1',
        },
      },
    },
  },
  plugins: [],
};
export default config;

