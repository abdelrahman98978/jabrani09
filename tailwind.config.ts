import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        cairo: ["Cairo", "sans-serif"],
        tajawal: ["Tajawal", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        ruby: {
          DEFAULT: "hsl(var(--ruby))",
          light: "hsl(var(--ruby-light))",
          dark: "hsl(var(--ruby-dark))",
        },
        charcoal: {
          DEFAULT: "hsl(var(--charcoal))",
          light: "hsl(var(--charcoal-light))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
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
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(100%)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // 3D Animations
        "float-3d": {
          "0%, 100%": { transform: "translateY(0) rotateX(0) rotateY(0)" },
          "25%": { transform: "translateY(-10px) rotateX(2deg) rotateY(2deg)" },
          "50%": { transform: "translateY(-15px) rotateX(0) rotateY(-2deg)" },
          "75%": { transform: "translateY(-8px) rotateX(-2deg) rotateY(1deg)" },
        },
        "rotate-3d": {
          "0%": { transform: "perspective(1000px) rotateY(0deg)" },
          "100%": { transform: "perspective(1000px) rotateY(360deg)" },
        },
        "tilt-3d": {
          "0%, 100%": { transform: "perspective(1000px) rotateX(0) rotateY(0)" },
          "50%": { transform: "perspective(1000px) rotateX(5deg) rotateY(5deg)" },
        },
        "slide-3d": {
          "0%": { transform: "perspective(1000px) translateZ(-100px) rotateX(10deg)", opacity: "0" },
          "100%": { transform: "perspective(1000px) translateZ(0) rotateX(0)", opacity: "1" },
        },
        "pop-3d": {
          "0%": { transform: "scale(0.8) translateZ(-50px)", opacity: "0" },
          "50%": { transform: "scale(1.05) translateZ(20px)" },
          "100%": { transform: "scale(1) translateZ(0)", opacity: "1" },
        },
        "flip-in": {
          "0%": { transform: "perspective(1000px) rotateY(-90deg)", opacity: "0" },
          "100%": { transform: "perspective(1000px) rotateY(0)", opacity: "1" },
        },
        "bounce-3d": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-20px) scale(1.05)" },
        },
        "swing-3d": {
          "0%, 100%": { transform: "perspective(1000px) rotateY(0)" },
          "25%": { transform: "perspective(1000px) rotateY(15deg)" },
          "75%": { transform: "perspective(1000px) rotateY(-15deg)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.9" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "fade-in-right": "fade-in-right 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "spin-slow": "spin-slow 8s linear infinite",
        // 3D Animations
        "float-3d": "float-3d 4s ease-in-out infinite",
        "rotate-3d": "rotate-3d 10s linear infinite",
        "tilt-3d": "tilt-3d 3s ease-in-out infinite",
        "slide-3d": "slide-3d 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "pop-3d": "pop-3d 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "flip-in": "flip-in 0.6s ease-out forwards",
        "bounce-3d": "bounce-3d 2s ease-in-out infinite",
        "swing-3d": "swing-3d 3s ease-in-out infinite",
        "pulse-scale": "pulse-scale 2s ease-in-out infinite",
      },
      boxShadow: {
        "premium": "0 25px 50px -12px hsl(0 80% 55% / 0.25)",
        "premium-lg": "0 35px 60px -15px hsl(0 80% 55% / 0.3)",
        "card-hover": "0 20px 40px -8px hsl(0 0% 0% / 0.15)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
