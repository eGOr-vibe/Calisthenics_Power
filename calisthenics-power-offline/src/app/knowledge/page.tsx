"use client";

import * as React from "react";
import Link from "next/link";
import {
  Brain, BookOpen, Sparkles, Move, Zap, FunctionSquare, Target,
  Utensils, BookMarked, Activity, CalendarDays, Moon, MapPin,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GridCard {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  titleKey: string;
  descKey: string;
  count?: number;
}

export default function KnowledgePage() {
  const { t } = useI18n();

  const cards: GridCard[] = [
    { href: "/knowledge/static/", icon: Move, iconColor: "text-red-500", iconBg: "bg-red-500/15", titleKey: "knowledge.staticTab", descKey: "knowledge.staticDesc", count: 4 },
    { href: "/goals/", icon: Target, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/15", titleKey: "knowledge.goalsProblemsTab", descKey: "knowledge.goalsProblemsDesc" },
    { href: "/nutrition/", icon: Utensils, iconColor: "text-amber-500", iconBg: "bg-amber-500/15", titleKey: "knowledge.nutritionSupplementsTab", descKey: "knowledge.nutritionSupplementsDesc" },
    { href: "/knowledge/techniques/", icon: Brain, iconColor: "text-red-500", iconBg: "bg-red-500/15", titleKey: "knowledge.techniquesTab", descKey: "knowledge.techniquesDesc", count: 28 },
    { href: "/knowledge/theory/", icon: BookOpen, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/15", titleKey: "knowledge.theoryTab", descKey: "knowledge.theoryDesc", count: 10 },
    { href: "/compound/", icon: Zap, iconColor: "text-amber-500", iconBg: "bg-amber-500/15", titleKey: "compound.title", descKey: "compound.subtitle" },
    { href: "/knowledge/formulas/", icon: FunctionSquare, iconColor: "text-sky-500", iconBg: "bg-sky-500/15", titleKey: "knowledge.formulasTab", descKey: "knowledge.formulasDesc" },
    { href: "/knowledge/formulas/", icon: Sparkles, iconColor: "text-amber-500", iconBg: "bg-amber-500/15", titleKey: "knowledge.aiTab", descKey: "knowledge.aiDesc" },
    { href: "/pain/", icon: Activity, iconColor: "text-red-500", iconBg: "bg-red-500/15", titleKey: "knowledge.painTab", descKey: "knowledge.painDesc" },
    { href: "/calendar/", icon: CalendarDays, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/15", titleKey: "knowledge.calendarTab", descKey: "knowledge.calendarDesc" },
    { href: "/sleep/", icon: Moon, iconColor: "text-purple-500", iconBg: "bg-purple-500/15", titleKey: "knowledge.sleepTab", descKey: "knowledge.sleepDesc" },
    { href: "/spots/", icon: MapPin, iconColor: "text-red-500", iconBg: "bg-red-500/15", titleKey: "knowledge.spotsTab", descKey: "knowledge.spotsDesc" },
  ];

  return (
    <MobileShell>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <h1 className="font-bold text-sm">{t("nav.brain")}</h1>
        </div>
      </header>
      <div className="flex-1 px-4 py-3">
        <div className="grid grid-cols-2 gap-2.5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href + card.titleKey} href={card.href} className="touch-manipulation">
                <Card className="p-3 flex flex-col gap-1.5 hover:border-primary/50 hover:bg-accent/40 active:scale-[0.98] transition-all cursor-pointer h-full min-h-[88px]">
                  <div className="flex items-center justify-between">
                    <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", card.iconBg)}>
                      <Icon className={cn("h-4 w-4", card.iconColor)} />
                    </div>
                    {typeof card.count === "number" && (
                      <Badge variant="secondary" className="text-[9px] h-4 min-w-[14px] flex items-center justify-center px-1">{card.count}</Badge>
                    )}
                  </div>
                  <h3 className="text-xs font-semibold leading-tight line-clamp-2">{t(card.titleKey as any)}</h3>
                  <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">{t(card.descKey as any)}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </MobileShell>
  );
}
