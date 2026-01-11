import type { Config } from "tailwindcss";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        // Primary: Dark Coral - #d35944
        primary: {
          50: "#f5e6e2",
          100: "#ebcdca",
          200: "#d79b95",
          300: "#c36960",
          400: "#d35944",
          500: "#d35944",
          600: "#b34032",
          700: "#8a2e24",
          800: "#61211a",
          900: "#3d1711",
          950: "#25100c",
        },
        // Secondary: Cadet - #5d7275
        secondary: {
          50: "#e8eced",
          100: "#d1d9db",
          200: "#a8b5b9",
          300: "#7f9197",
          400: "#5d7275",
          500: "#5d7275",
          600: "#4a5c5e",
          700: "#3e4d4f",
          800: "#364143",
          900: "#2f3a3b",
          950: "#272e2f",
        },
        // Success: Muted Green - #6b8f71
        success: {
          50: "#e8f0ea",
          100: "#d0e3d6",
          200: "#a6c7b1",
          300: "#7caa8d",
          400: "#6b8f71",
          500: "#6b8f71",
          600: "#56725b",
          700: "#465e4a",
          800: "#3f5441",
          900: "#364638",
          950: "#2e3b30",
        },
        // Warning: Warm Tan - #d9a574
        warning: {
          50: "#f7efe4",
          100: "#efe0c4",
          200: "#e2c296",
          300: "#d5a368",
          400: "#d9a574",
          500: "#d9a574",
          600: "#c48e5d",
          700: "#a6764e",
          800: "#8c6342",
          900: "#715237",
          950: "#5b422e",
        },
        // Error: Muted Red - #c44d56
        error: {
          50: "#f5e6e7",
          100: "#ebd0d1",
          200: "#dfa2a4",
          300: "#d37477",
          400: "#c44d56",
          500: "#c44d56",
          600: "#a63841",
          700: "#882f36",
          800: "#71292f",
          900: "#5e262b",
          950: "#4e2326",
        },
        // Neutral: Cadet - #5d7275 (same as secondary for this palette)
        neutral: {
          50: "#e8eced",
          100: "#d1d9db",
          200: "#a8b5b9",
          300: "#7f9197",
          400: "#5d7275",
          500: "#5d7275",
          600: "#4a5c5e",
          700: "#3e4d4f",
          800: "#364143",
          900: "#2f3a3b",
          950: "#272e2f",
        },
        // Accent: Peach - #fde6b0
        accent: {
          50: "#fef9f0",
          100: "#fef3e0",
          200: "#fde6b0",
          300: "#fdd984",
          400: "#fdd060",
          500: "#fde6b0",
          600: "#fbc63b",
          700: "#eba820",
          800: "#c28a16",
          900: "#9e6f14",
          950: "#805b14",
        },
        // Text: Yankees Blue - #1d2b36
        "text-primary": "#1d2b36",
        "text-secondary": "#5d7275",
      },
    },
  },
};
