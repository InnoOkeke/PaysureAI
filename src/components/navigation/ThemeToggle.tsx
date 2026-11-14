"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const handleToggle = () => {
    setTheme(isLight ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle hover:bg-hover border border-line-subtle text-ink-secondary hover:text-ink transition-all active:scale-95 focus-ring"
    >
      {isLight ? (
        <Moon className="h-4 w-4 text-accent-ink transition-transform duration-200" />
      ) : (
        <Sun className="h-4 w-4 text-warning transition-transform duration-200" />
      )}
    </button>
  );
}
