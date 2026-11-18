"use client";

import * as React from "react";
import { Info } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface FieldInfoProps {
  /** Localized "how to measure" instruction shown in the popover body. */
  text: string;
  /**
   * Optional accessible label for the trigger button.
   * Falls back to `text` (so screen readers expose the same instruction
   * without requiring the user to open the popover).
   */
  ariaLabel?: string;
}

/**
 * Small info trigger (lucide `Info`) that opens a popover with measurement
 * instructions. Designed to sit next to a form `<Label>`.
 *
 * - Touch target: 44×44 px (h-11 w-11) per the brief.
 * - Negative vertical/horizontal margins keep the inline label row compact
 *   (visually ~16px tall) while preserving the 44px tap area.
 * - `text-muted-foreground` matches the Label style; hover/focus lifts to
 *   `text-foreground` for affordance.
 */
export function FieldInfo({ text, ariaLabel }: FieldInfoProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel ?? text}
          className="inline-flex items-center justify-center h-11 w-11 -my-3.5 -ml-1.5 text-muted-foreground hover:text-foreground transition-colors touch-manipulation focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-md"
        >
          <Info className="h-4 w-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        sideOffset={4}
        className="w-72 max-w-[90vw] text-sm leading-relaxed"
      >
        <p>{text}</p>
      </PopoverContent>
    </Popover>
  );
}
