"use client";

import * as React from "react";
import Image from "next/image";
import type { ExerciseType } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  type: ExerciseType;
  slug: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

// Mapping exercise slugs to icon file names
// If no direct match, falls back to type-based icon
const SLUG_TO_ICON: Record<string, string> = {
  // Pull
  "pullup-classic": "pullup-classic",
  "pullup-australian": "pullup-classic", // similar pose
  "pullup-chin": "pullup-classic",
  "pullup-wide": "pullup-classic",
  "pullup-gironda": "pullup-classic",
  "pullup-archer": "pullup-classic",
  "pullup-lsit": "pullup-classic",
  "muscle-up": "pullup-classic",
  
  // Push
  "pushup-classic": "pushup-classic",
  "pushup-wide": "pushup-classic",
  "pushup-diamond": "pushup-classic",
  "pushup-archer": "pushup-classic",
  "pushup-pike": "pushup-classic",
  "pushup-tyson": "pushup-classic",
  "pushup-hindu": "pushup-classic",
  "pushup-clapping": "pushup-classic",
  "dips-classic": "pushup-classic",
  "dips-chest": "pushup-classic",
  "dips-triceps": "pushup-classic",
  "hspu-wall": "handstand-wall",
  "handstand-wall": "handstand-wall",
  "burpee": "burpee",
  
  // Core
  "plank": "plank",
  "plank-side": "side-plank",
  "crunch": "crunch",
  "situp": "crunch",
  "leg-raise": "leg-raise",
  "hanging-leg-raise": "leg-raise",
  "hollow-hold": "plank",
  "knee-tuck": "knee-tuck",
  "bicycle-crunch": "crunch",
  "dragon-flag": "leg-raise",
  "bridge-short": "bridge-short",
  "bridge-full": "bridge-short",
  
  // Legs
  "squat": "squat",
  "squat-sumo": "squat",
  "lunge": "lunge",
  "split-squat": "lunge",
  "jump-squat": "squat",
  "sissy-squat": "squat",
  "pistol-assisted": "squat",
  
  // Static
  "planche-tuck": "handstand-wall",
  "front-lever-tuck": "pullup-classic",
  "lsit-floor": "plank",
  "lsit-parallettes": "plank",
  "crow-stand": "handstand-wall",
  "elbow-lever": "plank",
  
  // Mobility
  "cat-cow": "cat-cow",
  "downward-dog": "downward-dog",
  "chest-opener": "chest-opener",
  "shoulder-circles": "shoulder-circles",
  "wrist-stretch": "wrist-stretch",
  
  // Weighted
  "weighted-pullup": "pullup-classic",
  "weighted-dip": "pushup-classic",
  "weighted-pushup": "pushup-classic",
  "weighted-squat": "squat",
  "weighted-plank": "plank",
  
  // Bands
  "band-pullup-assisted": "pullup-classic",
  "band-row": "pullup-classic",
  "band-chest-fly": "chest-opener",
  "band-shoulder-press": "handstand-wall",
  "band-pallofpress": "plank",
  
  // Rings
  "ring-row": "pullup-classic",
  "ring-pushup": "pushup-classic",
  "ring-dip": "pushup-classic",
  "ring-support-hold": "handstand-wall",
  "ring-muscle-up": "pullup-classic",
  "ring-l-sit": "plank",
  "ring-frog-stand": "handstand-wall",
  "ring-iron-cross": "handstand-wall",
  
  // Paul Wade
  "pushup-wall": "pushup-classic",
  "pushup-incline": "pushup-classic",
  "pushup-kneeling": "pushup-classic",
  "pushup-half": "pushup-classic",
  "pushup-decline": "pushup-classic",
  "squat-jackknife": "squat",
  "squat-half": "squat",
  "squat-close": "squat",
  "squat-assisted-one-leg": "squat",
  "pullup-vertical": "pullup-classic",
  "pullup-jackknife": "pullup-classic",
  "pullup-half": "pullup-classic",
  "pullup-half-narrow": "pullup-classic",
  "flat-knee-raise": "leg-raise",
  "flat-straight-leg-raise": "leg-raise",
  "bridge-head": "bridge-short",
  "bridge-straight": "bridge-short",
  "wall-handstand-hold": "handstand-wall",
  "half-hspu-wall": "handstand-wall",
  
  // Legendary
  "bear-crawl": "plank",
  "crab-walk": "plank",
  "pushup-sphinx": "plank",
  "pushup-tiger-bend": "plank",
  "typewriter-pullup": "pullup-classic",
  "skin-the-cat": "pullup-classic",
  
  // Other
  "pullup-gironda-hold": "pullup-classic",
  "pullup-onearm-neg": "pullup-classic",
  "front-lever-full": "pullup-classic",
  "front-lever-adv-tuck": "pullup-classic",
  "planche-adv-tuck": "handstand-wall",
  "vsit": "plank",
  "pushup-pseudo-planche": "pushup-classic",
  "pushup-onearm-wall": "pushup-classic",
  "pushup-onearm-knees": "pushup-classic",
  "pistol-full": "squat",
  "jump-squat-explosive": "squat",
};

// Fallback icons by type
const TYPE_FALLBACK: Record<ExerciseType, string> = {
  pull: "pullup-classic",
  push: "pushup-classic",
  core: "plank",
  legs: "squat",
  static: "handstand-wall",
  mobility: "cat-cow",
};

export function ExerciseIllustration({ type, slug, className, size = "md" }: Props) {
  const iconName = SLUG_TO_ICON[slug] ?? TYPE_FALLBACK[type];
  const iconPath = `/exercise-icons/${iconName}.png`;
  
  const sizeClass = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-40 h-40" : "w-20 h-20";
  
  return (
    <div className={cn("flex items-center justify-center", sizeClass, className)}>
      <Image
        src={iconPath}
        alt={slug}
        width={size === "sm" ? 40 : size === "lg" ? 160 : 80}
        height={size === "sm" ? 40 : size === "lg" ? 160 : 80}
        className="w-full h-full object-contain"
        unoptimized
      />
    </div>
  );
}
