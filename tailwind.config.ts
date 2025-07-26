import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom warm colors
        warmth: {
          50: "#fef6f0",
          100: "#fde8d8",
          200: "#f5d0b8",
          300: "#eab08a",
          400: "#de8f5f",
          500: "#d17344",
          600: "#b85838",
          700: "#984530",
          800: "#7b382b",
          900: "#663027",
        },
        sage: {
          50: "#f5f7f2",
          100: "#e7ebdf",
          200: "#cfd8c2",
          300: "#aeba97",
          400: "#87a96b",
          500: "#678549",
          600: "#516b3a",
          700: "#415530",
          800: "#364529",
          900: "#2e3a25",
        },
        trust: {
          50: "#eff6fb",
          100: "#d8e9f5",
          200: "#b5d5ec",
          300: "#82b9dd",
          400: "#6b9bd1",
          500: "#377bb1",
          600: "#2b5f95",
          700: "#274e79",
          800: "#254164",
          900: "#233854",
        },
        community: {
          50: "#fbf5f0",
          100: "#f5e7da",
          200: "#e9cab8",
          300: "#d9a68d",
          400: "#d19c6b",
          500: "#b66a40",
          600: "#a15634",
          700: "#84452d",
          800: "#6d3a29",
          900: "#5a3124",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config;