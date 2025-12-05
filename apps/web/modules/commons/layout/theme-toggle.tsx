"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  const handleThemeChange = () => {
    // Add transitioning class to html
    document.documentElement.classList.add("transitioning");

    // Change the theme
    setTheme(isDark ? "light" : "dark");

    // Remove the class after the transition
    setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
    }, 300);
  };

  return (
    <button
      onClick={handleThemeChange}
      className="relative inline-flex items-center w-16 h-9 rounded-full transition-colors bg-muted hover:bg-accent border border-foreground/10"
      aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
    >
      {/* Sliding background */}
      <div
        className={`absolute left-0.5 w-7 h-7 rounded-full bg-background shadow-md will-change-transform border border-foreground/20 ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
        style={{
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      {/* Icons inside the toggle */}
      <Sun
        className={`absolute left-1.5 w-5 h-5 ${
          isDark ? "opacity-0" : "opacity-100"
        } text-foreground/70`}
        style={{
          transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
      <Moon
        className={`absolute right-1.5 w-5 h-5 ${
          isDark ? "opacity-100" : "opacity-0"
        } text-primary`}
        style={{
          transition: "opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </button>
  );
}
