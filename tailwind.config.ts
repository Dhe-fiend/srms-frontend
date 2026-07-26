import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#0A0E14",
        surface: "#12161F",
        surfaceHover: "#171C27",
        border: "#232936",
        accent: {
          cyan: "#00E5C7",
          violet: "#7C6FFF",
        },
        text: {
          primary: "#E6EDF3",
          muted: "#8B95A5",
          faint: "#5B6472",
        },
        danger: "#FF5470",
        warn: "#FFB020",
        success: "#00E5C7",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "glow-gradient": "radial-gradient(circle at top left, rgba(0,229,199,0.12), transparent 50%), radial-gradient(circle at bottom right, rgba(124,111,255,0.10), transparent 50%)",
        "cta-gradient": "linear-gradient(135deg, #00E5C7 0%, #7C6FFF 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
