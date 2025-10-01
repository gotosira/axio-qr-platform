"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "warning" | "destructive";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ 
  title, 
  description, 
  variant = "default", 
  duration = 5000, 
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) {
          setTimeout(onClose, 150); // Allow exit animation
        }
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants = {
    default: "bg-card border-border text-card-foreground",
    success: "bg-success border-success text-success-foreground",
    warning: "bg-warning border-warning text-warning-foreground", 
    destructive: "bg-destructive border-destructive text-destructive-foreground",
  };

  const icons = {
    default: "ℹ️",
    success: "✅",
    warning: "⚠️",
    destructive: "❌",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`
            relative w-full max-w-sm p-4 rounded-lg border shadow-lg
            ${variants[variant]}
          `}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">{icons[variant]}</span>
            <div className="flex-1 min-w-0">
              {title && (
                <div className="font-medium text-sm mb-1">{title}</div>
              )}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                if (onClose) {
                  setTimeout(onClose, 150);
                }
              }}
              className="text-lg opacity-70 hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ToastContainer({ 
  toasts, 
  onRemoveToast 
}: { 
  toasts: ToastProps[]; 
  onRemoveToast: (id: string) => void; 
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemoveToast(toast.id)}
        />
      ))}
    </div>
  );
}