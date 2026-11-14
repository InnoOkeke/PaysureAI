"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { useTheme, type Theme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options: { label: string; value: Theme; icon: typeof Sun }[] = [
    { label: "Light", value: "light", icon: Sun },
    { label: "Dark", value: "dark", icon: Moon },
    { label: "System", value: "system", icon: Laptop },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        title={`Current theme: ${theme} (${resolvedTheme})`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.04] hover:bg-white/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-white/[0.08] dark:border-white/[0.08] text-slate-300 hover:text-white transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
      >
        {resolvedTheme === "light" ? (
          <Sun className="h-4 w-4 text-amber-500 transition-transform" />
        ) : (
          <Moon className="h-4 w-4 text-brand-400 transition-transform" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-[#0A0D14]/95 dark:bg-[#0A0D14]/95 border border-white/[0.1] dark:border-white/[0.1] p-1.5 shadow-2xl backdrop-blur-2xl z-50 text-xs">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all ${
                  isSelected
                    ? "bg-brand-600 text-white font-medium"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
