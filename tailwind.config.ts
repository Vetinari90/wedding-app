import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      colors: {
        wedding: {
          cream: "#faf7f2",
          rose: "#c9a9a6",
          sage: "#87a396",
          ink: "#3d3833",
        },
      },
    },
  },
  plugins: [],
};

export default config;
