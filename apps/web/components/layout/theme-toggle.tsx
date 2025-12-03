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

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center w-12 h-7 rounded-full transition-colors bg-muted hover:bg-accent"
      aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
    >
      {/* Sliding background */}
      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-5" : "translate-x-0"
        }`}
      />
      {/* Icons inside the toggle */}
      <Sun
        className={`absolute left-1.5 w-4 h-4 transition-opacity duration-300 ${
          isDark ? "opacity-0" : "opacity-100"
        } text-primary`}
      />
      <Moon
        className={`absolute right-1.5 w-4 h-4 transition-opacity duration-300 ${
          isDark ? "opacity-100" : "opacity-0"
        } text-primary`}
      />
    </button>
  );
}
