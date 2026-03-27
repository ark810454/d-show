import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        sand: "#F8F5EE",
        gold: "#C28A2D",
        pine: "#0E5F59",
        coral: "#D95D39",
        mist: "#DDE6E0",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["'Segoe UI'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px rgba(15, 23, 42, 0.08)",
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(194,138,45,0.14), transparent 30%), radial-gradient(circle at 80% 0%, rgba(14,95,89,0.14), transparent 24%), linear-gradient(135deg, #f8f5ee 0%, #ffffff 52%, #eef5f1 100%)",
      },
    },
  },
  plugins: [],
};

export default config;

