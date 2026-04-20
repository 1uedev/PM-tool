/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/app/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
          light: "#a5b4fc",
        },
        accent: "#06b6d4",
        dark: {
          DEFAULT: "#0f172a",
          muted: "#1e293b",
        },
        success: "#10b981",
      },
    },
  },
  plugins: [],
};

export default config;
