/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Adjust the paths as needed
    "./src/**/*.{js,ts,jsx,tsx}", // Include all your files that use Tailwind classes
  ],
  theme: {
    extend: {
      fontFamily: {
        Bellina: ["Bellina", "sans-serif"],
      },
    },
  },
  plugins: [],
};
