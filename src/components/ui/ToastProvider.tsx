"use client";

import React, { createContext, useContext, useState, useCallback, useId } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-dismiss after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const toast = {
    success: (message: string, title?: string) => addToast("success", message, title),
    error: (message: string, title?: string) => addToast("error", message, title),
    warning: (message: string, title?: string) => addToast("warning", message, title),
    info: (message: string, title?: string) => addToast("info", message, title),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Apple/Material 3 Toast Container */}
      <div 
        aria-live="polite" 
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2.5 max-w-md w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl backdrop-blur-2xl border transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              t.type === "success"
                ? "bg-[#0A1612]/95 border-emerald-500/30 text-emerald-200 dark:bg-[#0A1612]/95 dark:border-emerald-500/30 dark:text-emerald-200"
                : t.type === "error"
                ? "bg-[#180A0A]/95 border-rose-500/30 text-rose-200 dark:bg-[#180A0A]/95 dark:border-rose-500/30 dark:text-rose-200"
                : t.type === "warning"
                ? "bg-[#1A1408]/95 border-amber-500/30 text-amber-200 dark:bg-[#1A1408]/95 dark:border-amber-500/30 dark:text-amber-200"
                : "bg-[#0B132B]/95 border-cyan-500/30 text-cyan-200 dark:bg-[#0B132B]/95 dark:border-cyan-500/30 dark:text-cyan-200"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {t.type === "error" && <XCircle className="h-4 w-4 text-rose-400" />}
              {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {t.type === "info" && <Info className="h-4 w-4 text-cyan-400" />}
            </div>

            <div className="flex-1 text-xs leading-relaxed">
              {t.title && <p className="font-semibold text-white mb-0.5">{t.title}</p>}
              <p className="font-medium">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
