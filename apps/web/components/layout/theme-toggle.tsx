"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="hidden p-2 text-foreground rounded-full hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:block"
      aria-label={`Cambiar a modo ${resolvedTheme === "dark" ? "claro" : "oscuro"}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
