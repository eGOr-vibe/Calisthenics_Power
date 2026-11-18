"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SVG-иконки статических элементов калистеники.
 * Показывают силуэт тела в каждой позиции.
 *
 * props.icon — строка из seed-данных: "Planche" | "FrontLever" | "LSit" | "Handstand".
 * Если иконка неизвестна — fallback на "Planche".
 */

export type StaticElementIconName =
  | "Planche"
  | "FrontLever"
  | "LSit"
  | "Handstand";

export function StaticElementIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const name = (icon as StaticElementIconName) ?? "Planche";
  switch (name) {
    case "FrontLever":
      return <FrontLeverIcon className={className} />;
    case "LSit":
      return <LSitIcon className={className} />;
    case "Handstand":
      return <HandstandIcon className={className} />;
    case "Planche":
    default:
      return <PlancheIcon className={className} />;
  }
}

// ====== Individual icons (24x24 viewBox) ======

function PlancheIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      {/* Floor line */}
      <path d="M3 21h18" opacity={0.4} />
      {/* Body horizontal */}
      <path d="M5 13h13" />
      {/* Arms from shoulders down to floor */}
      <path d="M7 13v7" />
      <path d="M16 13v7" />
      {/* Head */}
      <circle cx="4.5" cy="12.5" r="1.4" fill="currentColor" stroke="none" />
      {/* Legs (extended) */}
      <path d="M18 13l3 -2" />
    </svg>
  );
}

function FrontLeverIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      {/* Bar */}
      <path d="M2 4h20" />
      {/* Arms hanging straight down from bar */}
      <path d="M9 4v6" />
      <path d="M15 4v6" />
      {/* Body horizontal */}
      <path d="M6 11h13" />
      {/* Head */}
      <circle cx="5" cy="11" r="1.4" fill="currentColor" stroke="none" />
      {/* Legs extended */}
      <path d="M19 11l3 -2" />
    </svg>
  );
}

function LSitIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      {/* Floor line */}
      <path d="M3 21h18" opacity={0.4} />
      {/* Arms straight down to floor */}
      <path d="M8 11v10" />
      <path d="M16 11v10" />
      {/* Torso vertical */}
      <path d="M12 11v-6" />
      {/* Head */}
      <circle cx="12" cy="3" r="1.6" fill="currentColor" stroke="none" />
      {/* Shoulders/hips horizontal */}
      <path d="M7 11h10" />
      {/* Legs horizontal forward (L-shape) */}
      <path d="M7 11h13" />
    </svg>
  );
}

function HandstandIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      {/* Floor line */}
      <path d="M3 21h18" opacity={0.4} />
      {/* Arms to floor */}
      <path d="M10 21v-7" />
      <path d="M14 21v-7" />
      {/* Body vertical (upside down) */}
      <path d="M12 14v-9" />
      {/* Head */}
      <circle cx="12" cy="3.5" r="1.6" fill="currentColor" stroke="none" />
      {/* Legs split (straddle for balance) */}
      <path d="M12 5l-4 -3" />
      <path d="M12 5l4 -3" />
    </svg>
  );
}
