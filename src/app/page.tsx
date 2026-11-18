"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Timer,
  Flame,
  TrendingUp,
  Activity,
  Calendar,
  Plus,
  ChevronRight,
  Zap,
  Target,
  Dumbbell,
  Brain,
} from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { stressIndexLabel } from "@/lib/biomech";
import { calcMenstrualCycle } from "@/lib/menstrual-cycle";
import { AnimatePresence } from "framer-motion";
import { SplashScreen, useSplashGate } from "@/components/splash-screen";

const MENSTRUAL_PHASE_BADGE: Record<string, string> = {
  menstrual: "bg-red-500/15 text-red-500 border-red-500/30",
  follicular: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  ovulation: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  luteal: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export default function HomePage() {
  const { t, locale } = useI18n();
  const { showSplash, dismiss } = useSplashGate();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) return null;
      return res.json();
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ["sessions", "recent"],
    queryFn: async () => {
      const res = await fetch("/api/workouts/sessions?limit=5");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const profile = profileQuery.data;
  const sessions = sessionsQuery.data ?? [];
  const stressIdx = profile?.lastStressIndex ?? null;
  const stress = stressIndexLabel(stressIdx, locale);

  const stressColor =
    stress.zone === "low"
      ? "text-emerald-500"
      : stress.zone === "medium"
      ? "text-amber-500"
      : "text-red-500";

  const firstName = profile?.name ? profile.name.split(" ")[0] : null;
  const isFemale = profile?.gender === "female";
  const fullGreeting = firstName
    ? t("home.greetingUser", { name: firstName })
    : isFemale
    ? t("home.greetingFemale")
    : t("home.greeting");

  const cycle = React.useMemo(() => {
    if (!isFemale) return null;
    return calcMenstrualCycle(profile?.lastMenstrualDate ?? null);
  }, [isFemale, profile?.lastMenstrualDate]);

  // Quick navigation cards (horizontal scroll)
  const QUICK_NAV = [
    { href: "/simple-timer", icon: Timer, label: t("nav.timer"), color: "text-red-500", bg: "bg-red-500/15" },
    { href: "/exercises", icon: Dumbbell, label: t("nav.library"), color: "text-emerald-500", bg: "bg-emerald-500/15" },
    { href: "/knowledge", icon: Brain, label: t("nav.brain"), color: "text-amber-500", bg: "bg-amber-500/15" },
    { href: "/biomech", icon: Activity, label: t("biomech.title"), color: "text-red-500", bg: "bg-red-500/15" },
    { href: "/goals", icon: Target, label: t("goals.title"), color: "text-emerald-500", bg: "bg-emerald-500/15" },
    { href: "/nutrition", icon: Zap, label: t("nutrition.title"), color: "text-amber-500", bg: "bg-amber-500/15" },
  ];

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={dismiss} />}
      </AnimatePresence>
      <MobileShell>
        {/* Compact header */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
          <div className="flex items-center justify-between px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">CP</span>
            </div>
            <div className="flex items-center gap-2">
              {stressIdx !== null && (
                <Badge variant="outline" className={cn("text-[10px] h-5", stressColor)}>
                  {stress.label} {(stressIdx * 100).toFixed(0)}%
                </Badge>
              )}
              <Link href="/profile">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Profile">
                  <Activity className="h-4 w-4 text-primary" />
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Main content — fits one screen, no vertical scroll */}
        <div className="flex-1 flex flex-col px-4 py-3 gap-3 overflow-hidden">
          {/* Greeting — compact */}
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold tracking-tight">
              {fullGreeting}
            </h2>
            <span className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", { weekday: "short", day: "numeric", month: "short" })}
            </span>
          </div>

          {/* Quick nav — horizontal scroll, compact icons */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar shrink-0">
            {QUICK_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 touch-manipulation"
                >
                  <div className="flex flex-col items-center gap-1 w-14">
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", item.bg)}>
                      <Icon className={cn("h-5 w-5", item.color)} />
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[56px]">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Quick start — horizontal scroll cards */}
          <div className="shrink-0">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("home.quickStart")}
              </h3>
              <Link href="/builder">
                <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2">
                  <Plus className="h-3 w-3 mr-0.5" />
                  {t("builder.title")}
                </Button>
              </Link>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
              {[
                { href: "/builder?format=amrap", label: t("format.amrap"), desc: t("format.amrap.desc") },
                { href: "/builder?format=emom", label: t("format.emom"), desc: t("format.emom.desc") },
                { href: "/builder?format=tabata", label: t("format.tabata"), desc: t("format.tabata.desc") },
                { href: "/builder?format=interval", label: t("format.interval"), desc: t("format.interval.desc") },
                { href: "/simple-timer", label: t("simpleTimer.title"), desc: locale === "ru" ? "Простой таймер" : "Simple timer" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 touch-manipulation"
                >
                  <Card className="p-3 w-32 h-20 flex flex-col justify-between hover:border-primary/50 transition-colors cursor-pointer">
                    <Timer className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-bold text-xs leading-tight">{item.label}</div>
                      <p className="text-[9px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Menstrual cycle — compact (if applicable) */}
          {cycle && (
            <Link href="/profile" className="shrink-0 touch-manipulation">
              <Card className="p-2.5 flex items-center gap-2.5 hover:border-primary/50 transition-colors">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{t("menstrual.title")}</span>
                    <Badge variant="outline" className={cn("text-[9px] h-4 px-1", MENSTRUAL_PHASE_BADGE[cycle.phase])}>
                      {t(`menstrual.phase.${cycle.phase}` as DictKey)}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {locale === "ru" ? cycle.recommendationRu : cycle.recommendationEn}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-primary shrink-0">
                  {Math.round(cycle.trainingAdjustment * 100)}%
                </span>
              </Card>
            </Link>
          )}

          {/* Recent workouts — horizontal scroll */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-1.5 shrink-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("home.recentWorkouts")}
              </h3>
              {sessions.length > 0 && (
                <Link href="/history">
                  <Button variant="ghost" size="sm" className="h-6 text-[11px] px-2">
                    {t("history.title")}
                    <ChevronRight className="h-3 w-3 ml-0.5" />
                  </Button>
                </Link>
              )}
            </div>

            {sessions.length === 0 ? (
              <Card className="p-3 text-center border-dashed flex-1 flex flex-col items-center justify-center">
                <Timer className="h-6 w-6 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">{t("home.noWorkouts")}</p>
                <Link href="/builder">
                  <Button variant="default" size="sm" className="mt-2 h-8 text-xs">
                    {t("home.startFirst")}
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar flex-1">
                {sessions.map((s: any) => (
                  <Link
                    key={s.id}
                    href={`/history/${s.id}`}
                    className="shrink-0 touch-manipulation"
                  >
                    <Card className="p-2.5 w-28 h-full flex flex-col gap-1 hover:border-primary/50 transition-colors">
                      <Badge variant="secondary" className="text-[9px] uppercase h-4 w-fit px-1">
                        {s.format}
                      </Badge>
                      <span className="text-xs font-semibold tabular-nums">
                        {Math.floor(s.durationSec / 60)}:{(s.durationSec % 60).toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {t("timer.round")} {s.totalRounds}
                      </span>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {t("history.volume")}: {s.totalVolume.toFixed(0)}
                      </span>
                      <span className="text-[9px] text-muted-foreground mt-auto">
                        {new Date(s.startedAt).toLocaleDateString(
                          locale === "ru" ? "ru-RU" : "en-US",
                          { day: "numeric", month: "short" }
                        )}
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer — minimal */}
          <footer className="text-center shrink-0">
            <p className="text-[9px] text-muted-foreground">CP v0.8.0</p>
          </footer>
        </div>
      </MobileShell>
    </>
  );
}
