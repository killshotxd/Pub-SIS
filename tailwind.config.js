/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        "70/30": "70% 30%",
        "30/70": "30% 70%",
        "20/80": "20% 80%",
        "25/75": "25% 75%",
      },
    },
  },
  plugins: [require("daisyui")],
};
