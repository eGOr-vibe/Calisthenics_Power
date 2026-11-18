"use client";

import * as React from "react";
import Link from "next/link";
import { getSupplements } from "@/lib/local-storage";
import {
  ArrowLeft,
  ChevronRight,
  Pill,
  Dumbbell,
  HeartPulse,
  Bone,
  Zap,
  Moon,
  Apple,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Supplement, SupplementCategory, SupplementEfficacy } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const CATEGORY_OPTIONS = [
  "all",
  "strength",
  "recovery",
  "joints",
  "energy",
  "sleep",
  "vitamins",
] as const;
type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

const CATEGORY_META: Record<
  Exclude<CategoryOption, "all">,
  { badge: string; bg: string; text: string; icon: React.ReactNode }
> = {
  strength: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    icon: <Dumbbell className="h-5 w-5" />,
  },
  recovery: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    icon: <HeartPulse className="h-5 w-5" />,
  },
  joints: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    icon: <Bone className="h-5 w-5" />,
  },
  energy: {
    badge: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    bg: "bg-yellow-500/15",
    text: "text-yellow-500",
    icon: <Zap className="h-5 w-5" />,
  },
  sleep: {
    badge: "bg-teal-500/15 text-teal-500 border-teal-500/30",
    bg: "bg-teal-500/15",
    text: "text-teal-500",
    icon: <Moon className="h-5 w-5" />,
  },
  vitamins: {
    badge: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    bg: "bg-purple-500/15",
    text: "text-purple-500",
    icon: <Apple className="h-5 w-5" />,
  },
};

const EFFICACY_META: Record<
  SupplementEfficacy,
  { badge: string; icon: React.ReactNode; iconSmall: React.ReactNode }
> = {
  validated: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    icon: <CheckCircle2 className="h-5 w-5" />,
    iconSmall: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  mixed: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    icon: <AlertTriangle className="h-5 w-5" />,
    iconSmall: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  ineffective: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    icon: <XCircle className="h-5 w-5" />,
    iconSmall: <XCircle className="h-3.5 w-3.5" />,
  },
};

// ====== Helpers ======

function supplementName(
  s: Pick<Supplement, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? s.nameRu : s.nameEn;
}

function supplementDosage(
  s: Pick<Supplement, "dosageRu" | "dosageEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? s.dosageRu : s.dosageEn;
}

// ====== Main component ======

export default function SupplementsPage() {
  const { t, locale } = useI18n();
  const [category, setCategory] = React.useState<CategoryOption>("all");

  const allSupplements = React.useMemo(() => getSupplements(), []);

  const filteredSupplements =
    category === "all"
      ? allSupplements
      : allSupplements.filter((s) => s.category === category);

  return (
    <MobileShell>
      <PageHeader
        title={t("supplements.title")}
        subtitle={t("supplements.subtitle")}
        right={
          <Link href="/knowledge" aria-label={t("common.back")}>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] h-11 w-11"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        }
      />

      <div className="flex-1 px-4 py-3 space-y-4">
        {/* Intro */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("supplements.intro")}
        </p>

        {/* Disclaimer */}
        <Card className="p-3 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-foreground/90">
              {t("supplements.disclaimer")}
            </p>
          </div>
        </Card>

        {/* Category chips */}
        <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
          <div className="flex items-center gap-2 w-max pb-1">
            {CATEGORY_OPTIONS.map((cat) => {
              const isActive = category === cat;
              const meta =
                cat === "all" ? null : CATEGORY_META[cat as Exclude<CategoryOption, "all">];
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "shrink-0 h-9 px-3.5 rounded-full text-xs font-medium border transition-colors touch-manipulation min-h-[44px] flex items-center gap-1.5",
                    isActive
                      ? meta
                        ? cn(meta.badge, "font-semibold")
                        : "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-accent/50",
                  )}
                >
                  {meta && <span className={meta.text}>{meta.icon}</span>}
                  <span>{t(`supplements.category.${cat}` as DictKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {filteredSupplements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {filteredSupplements.map((s) => (
              <SupplementCard key={s.slug} supplement={s} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function SupplementCard({
  supplement,
  locale,
}: {
  supplement: Supplement;
  locale: "ru" | "en";
}) {
  const { t } = useI18n();
  const meta =
    CATEGORY_META[supplement.category as Exclude<CategoryOption, "all">] ?? {
      badge: "bg-muted text-muted-foreground border-border",
      bg: "bg-muted",
      text: "text-muted-foreground",
      icon: <Pill className="h-5 w-5" />,
    };
  const eff = EFFICACY_META[supplement.efficacy] ?? EFFICACY_META.mixed;

  return (
    <Link
      href={`/supplements/${supplement.slug}`}
      className="block touch-manipulation"
      aria-label={supplementName(supplement, locale)}
    >
      <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                meta.bg,
                meta.text,
              )}
            >
              {meta.icon}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm leading-tight">
                {supplementName(supplement, locale)}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-1">
                {supplementDosage(supplement, locale)}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <Badge
            variant="outline"
            className={cn("border text-[10px]", meta.badge)}
          >
            {t(`supplements.category.${supplement.category}` as DictKey)}
          </Badge>
          <Badge
            variant="outline"
            className={cn("border text-[10px] inline-flex items-center gap-1", eff.badge)}
          >
            {eff.iconSmall}
            <span>{t(`supplements.efficacy.${supplement.efficacy}` as DictKey)}</span>
          </Badge>
        </div>
      </Card>
    </Link>
  );
}

// (SkeletonList and ErrorState removed for offline build)

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Pill className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("supplements.empty")}</p>
    </div>
  );
}

// (ErrorState removed for offline build)
