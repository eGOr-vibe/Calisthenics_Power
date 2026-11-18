"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Timer, Library, Brain, User } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  labelKey: "nav.home" | "nav.timer" | "nav.library" | "nav.brain" | "nav.profile";
  match: (path: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", icon: Home, labelKey: "nav.home", match: (p) => p === "/" },
  { href: "/simple-timer", icon: Timer, labelKey: "nav.timer", match: (p) => p.startsWith("/simple-timer") || p.startsWith("/builder") || p.startsWith("/timer") },
  { href: "/exercises", icon: Library, labelKey: "nav.library", match: (p) => p.startsWith("/exercises") },
  { href: "/knowledge", icon: Brain, labelKey: "nav.brain", match: (p) => p.startsWith("/knowledge") || p.startsWith("/techniques") || p.startsWith("/theory") || p.startsWith("/ai") },
  { href: "/profile", icon: User, labelKey: "nav.profile", match: (p) => p.startsWith("/profile") || p.startsWith("/settings") },
];

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  // Hide bottom-nav on /timer (immersive workout screen with its own sticky controls)
  if (pathname.startsWith("/timer")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-bottom"
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-stretch justify-around">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={t(item.labelKey)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                "min-h-[44px] min-w-[44px] touch-manipulation",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className={cn("text-[10px] leading-tight", active && "font-semibold")}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
