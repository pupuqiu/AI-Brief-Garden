import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3EA",
        card: "#FFFDF8",
        ink: "#1F2933",
        muted: "#6B7280",
        line: "#E7DDCF",
        accent: "#A46A3F",
        accentSoft: "#F4E9DC"
      },
      fontFamily: {
        sans: [
          "PingFang SC",
          "Noto Sans SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "Source Han Sans SC",
          "sans-serif"
        ],
        serif: [
          "Songti SC",
          "Noto Serif SC",
          "Source Han Serif SC",
          "STSong",
          "serif"
        ]
      },
      boxShadow: {
        paper: "0 12px 30px rgba(86, 72, 51, 0.08)",
        lift: "0 20px 40px rgba(86, 72, 51, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
