"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface MobileShellProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
  hasBottomPadding?: boolean;
}

/**
 * Mobile-first оболочка:
 * - центрирует контент на десктопе (max-w-md)
 * - добавляет sticky header сверху
 * - зарезервирует место под bottom nav снизу (если showBottomNav)
 */
export function MobileShell({
  children,
  showBottomNav = true,
  hasBottomPadding = true,
}: MobileShellProps) {
  return (
    <div className="mobile-container bg-background">
      <main
        className={cn(
          "flex-1 flex flex-col min-h-0",
          showBottomNav && hasBottomPadding && "pb-24"
        )}
      >
        {children}
      </main>
    </div>
  );
}
