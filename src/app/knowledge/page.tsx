"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Brain,
  BookOpen,
  Sparkles,
  Move,
  Zap,
  Search,
  FunctionSquare,
  Target,
  Utensils,
  BookMarked,
  Activity,
  CalendarDays,
  Moon,
  MapPin,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import type {
  Technique,
  TheoryArticle,
  TechniqueCategory,
  StaticElement,
} from "@/lib/types";

// ====== Category colors (shared across knowledge screens) ======

export const TECHNIQUE_CATEGORY_COLORS: Record<
  TechniqueCategory,
  { badge: string; bg: string; text: string; ring: string }
> = {
  cns: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    ring: "ring-red-500/30",
  },
  mental: {
    badge: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    bg: "bg-purple-500/15",
    text: "text-purple-500",
    ring: "ring-purple-500/30",
  },
  relax: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    ring: "ring-emerald-500/30",
  },
  warmup: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    ring: "ring-amber-500/30",
  },
  cooldown: {
    badge: "bg-teal-500/15 text-teal-500 border-teal-500/30",
    bg: "bg-teal-500/15",
    text: "text-teal-500",
    ring: "ring-teal-500/30",
  },
};

// ====== Helpers ======

function techniqueName(tech: Technique, locale: "ru" | "en"): string {
  return locale === "ru" ? tech.nameRu : tech.nameEn;
}

function techniqueDesc(tech: Technique, locale: "ru" | "en"): string {
  return locale === "ru" ? tech.descriptionRu : tech.descriptionEn;
}

function theoryTitle(article: TheoryArticle, locale: "ru" | "en"): string {
  return locale === "ru" ? article.titleRu : article.titleEn;
}

// ====== Card data — compact grid items ======

interface GridCardData {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  titleKey: string;
  descKey: string;
  count?: number;
  loading?: boolean;
}

// ====== Main page ======

export default function KnowledgePage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [searchInput, setSearchInput] = React.useState("");

  const techniquesQuery = useQuery({
    queryKey: ["techniques", "all"],
    queryFn: async () => {
      const res = await fetch("/api/techniques");
      if (!res.ok) throw new Error("techniques fetch failed");
      return (await res.json()) as Technique[];
    },
  });

  const theoryQuery = useQuery({
    queryKey: ["theory", "all"],
    queryFn: async () => {
      const res = await fetch("/api/theory");
      if (!res.ok) throw new Error("theory fetch failed");
      return (await res.json()) as TheoryArticle[];
    },
  });

  const staticQuery = useQuery({
    queryKey: ["static-elements"],
    queryFn: async () => {
      const res = await fetch("/api/static-elements");
      if (!res.ok) throw new Error("static-elements fetch failed");
      return (await res.json()) as StaticElement[];
    },
  });

  const techniques = techniquesQuery.data ?? [];
  const theory = theoryQuery.data ?? [];
  const statics = staticQuery.data ?? [];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed.length >= 2) {
        router.push(`/knowledge/search?q=${encodeURIComponent(trimmed)}`);
        setSearchInput("");
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, router]);

  const cards: GridCardData[] = [
    { href: "/knowledge/static", icon: Move, iconColor: "text-red-500", iconBg: "bg-red-500/15",
      titleKey: "knowledge.staticTab", descKey: "knowledge.staticDesc", count: statics.length, loading: staticQuery.isLoading },
    { href: "/goals", icon: Target, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/15",
      titleKey: "knowledge.goalsProblemsTab", descKey: "knowledge.goalsProblemsDesc" },
    { href: "/nutrition", icon: Utensils, iconColor: "text-amber-500", iconBg: "bg-amber-500/15",
      titleKey: "knowledge.nutritionSupplementsTab", descKey: "knowledge.nutritionSupplementsDesc" },
    { href: "/knowledge/techniques", icon: Brain, iconColor: "text-red-500", iconBg: "bg-red-500/15",
      titleKey: "knowledge.techniquesTab", descKey: "knowledge.techniquesDesc", count: techniques.length, loading: techniquesQuery.isLoading },
    { href: "/knowledge/theory", icon: BookOpen, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/15",
      titleKey: "knowledge.theoryTab", descKey: "knowledge.theoryDesc", count: theory.length, loading: theoryQuery.isLoading },
    { href: "/compound", icon: Zap, iconColor: "text-amber-500", iconBg: "bg-amber-500/15",
      titleKey: "compound.title", descKey: "compound.subtitle" },
    { href: "/knowledge/formulas", icon: FunctionSquare, iconColor: "text-sky-500", iconBg: "bg-sky-500/15",
      titleKey: "knowledge.formulasTab", descKey: "knowledge.formulasDesc" },
    { href: "/knowledge/ai", icon: Sparkles, iconColor: "text-amber-500", iconBg: "bg-amber-500/15",
      titleKey: "knowledge.aiTab", descKey: "knowledge.aiDesc" },
    { href: "/diary", icon: BookMarked, iconColor: "text-red-500", iconBg: "bg-red-500/15",
      titleKey: "knowledge.diaryTab", descKey: "knowledge.diaryDesc" },
    { href: "/pain", icon: Activity, iconColor: "text-red-500", iconBg: "bg-red-500/15",
      titleKey: "knowledge.painTab", descKey: "knowledge.painDesc" },
    { href: "/calendar", icon: CalendarDays, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/15",
      titleKey: "knowledge.calendarTab", descKey: "knowledge.calendarDesc" },
    { href: "/sleep", icon: Moon, iconColor: "text-purple-500", iconBg: "bg-purple-500/15",
      titleKey: "knowledge.sleepTab", descKey: "knowledge.sleepDesc" },
    { href: "/spots", icon: MapPin, iconColor: "text-red-500", iconBg: "bg-red-500/15",
      titleKey: "knowledge.spotsTab", descKey: "knowledge.spotsDesc" },
  ];

  return (
    <MobileShell>
      {/* Compact header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <h1 className="font-bold text-sm">{t("nav.brain")}</h1>
        </div>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t("search.placeholderGlobal")}
              className="pl-9 h-9 min-h-[36px] rounded-lg bg-card text-sm"
              aria-label={t("search.placeholderGlobal")}
            />
          </div>
        </div>
      </header>

      {/* Grid 2×N — compact, minimal scroll */}
      <div className="flex-1 px-4 py-3">
        <div className="grid grid-cols-2 gap-2.5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="touch-manipulation"
              >
                <Card className="p-3 flex flex-col gap-1.5 hover:border-primary/50 hover:bg-accent/40 active:scale-[0.98] transition-all cursor-pointer h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", card.iconBg)}>
                      <Icon className={cn("h-4 w-4", card.iconColor)} />
                    </div>
                    {typeof card.count === "number" && !card.loading && (
                      <Badge variant="secondary" className="text-[9px] h-4 min-w-[14px] flex items-center justify-center px-1">
                        {card.count}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold leading-tight line-clamp-2">
                    {t(card.titleKey as any)}
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                    {card.loading ? "..." : t(card.descKey as any)}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
