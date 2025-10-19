/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0F9D58",
        blue: "#1E40AF",
        success: "#059669",
        danger: "#DC2626",
        gray: "#6B7280",
        slate: "#0F172A"
      }
    }
  },
  plugins: []
};
