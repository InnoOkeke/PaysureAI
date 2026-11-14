"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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

  const addToast = useCallback(
    (type: ToastType, message: string, title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

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
            role="status"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-elevated/95 shadow-popover backdrop-blur-2xl border transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 ${
              t.type === "success"
                ? "border-success-border"
                : t.type === "error"
                ? "border-danger-border"
                : t.type === "warning"
                ? "border-warning-border"
                : "border-info-border"
            }`}
          >
            <div
              className={`shrink-0 h-7 w-7 rounded-xl flex items-center justify-center ${
                t.type === "success"
                  ? "bg-success-soft text-success"
                  : t.type === "error"
                  ? "bg-danger-soft text-danger"
                  : t.type === "warning"
                  ? "bg-warning-soft text-warning"
                  : "bg-info-soft text-info"
              }`}
            >
              {t.type === "success" && <CheckCircle2 className="h-4 w-4" />}
              {t.type === "error" && <XCircle className="h-4 w-4" />}
              {t.type === "warning" && <AlertTriangle className="h-4 w-4" />}
              {t.type === "info" && <Info className="h-4 w-4" />}
            </div>

            <div className="flex-1 text-xs leading-relaxed pt-0.5">
              {t.title && <p className="font-semibold text-ink mb-0.5">{t.title}</p>}
              <p className="text-ink-secondary font-medium">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-hover transition-colors focus-ring"
              aria-label="Close notification"
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
