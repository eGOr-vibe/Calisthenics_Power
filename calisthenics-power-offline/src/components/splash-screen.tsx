"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface SplashScreenProps {
  onComplete: () => void;
  /** Длительность показа до начала fade-out, мс */
  durationMs?: number;
}

/**
 * Splash screen с крупными буквами «CP» (Calisthenics Power).
 * Через durationMs мс вызывается onComplete → родитель скрывает компонент.
 * Fade-out реализован через AnimatePresence на родителе.
 */
export function SplashScreen({
  onComplete,
  durationMs = 1800,
}: SplashScreenProps) {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, durationMs);
    return () => clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      aria-hidden
    >
      {/* Большая CP с gradient + glow */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        <h1 className="text-8xl font-black tracking-tighter bg-gradient-to-br from-primary via-red-500 to-red-700 bg-clip-text text-transparent">
          CP
        </h1>
        {/* Glow эффект под буквами */}
        <div className="absolute inset-0 blur-2xl bg-primary/30 -z-10" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-4"
      >
        <p className="text-sm font-medium text-muted-foreground tracking-widest uppercase">
          Calisthenics Power
        </p>
        <p className="text-xs text-muted-foreground mt-1 text-center">v0.8.0</p>
      </motion.div>

      {/* Прогресс-бар снизу */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute bottom-20 h-0.5 bg-primary max-w-[200px] mx-auto"
      />
    </motion.div>
  );
}

/**
 * Обёртка для удобного использования в page-компонентах.
 * Хранит флаг «сплэш уже показан» в sessionStorage, чтобы не показывать
 * при возврате через back-кнопку.
 */
export function useSplashGate(storageKey = "cp_splash_shown") {
  const [showSplash, setShowSplash] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!sessionStorage.getItem(storageKey)) {
        setShowSplash(true);
        sessionStorage.setItem(storageKey, "1");
      }
    } catch {
      // sessionStorage может быть недоступен (private mode и т.д.) — просто показываем
      setShowSplash(true);
    }
  }, [storageKey]);

  const dismiss = React.useCallback(() => setShowSplash(false), []);

  return { showSplash, dismiss };
}

export { AnimatePresence };
