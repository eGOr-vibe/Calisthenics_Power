"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Move } from "lucide-react";
import {
  getStaticElements,
  getProgressionStates,
} from "@/lib/local-storage";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type {
  StaticElement,
  StaticElementSlug,
  ProgressionState,
} from "@/lib/types";
import { StaticElementIcon } from "@/components/static-element-icon";

// ====== Helpers ======

function elementName(
  el: Pick<StaticElement, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? el.nameRu : el.nameEn;
}

function elementDesc(
  el: Pick<StaticElement, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? el.descriptionRu : el.descriptionEn;
}

// ====== Main component ======

export default function StaticListPage() {
  const { t, locale } = useI18n();

  const elements = React.useMemo(() => getStaticElements(), []);
  const progressionMap = React.useMemo(() => {
    const map: Partial<Record<StaticElementSlug, ProgressionState>> = {};
    const all = getProgressionStates();
    for (const el of elements) {
      const found = all.find((p) => p.elementSlug === el.slug);
      if (found) map[el.slug] = found;
    }
    return map;
  }, [elements]);

  return (
    <MobileShell>
      <PageHeader
        title={t("static.title")}
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

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Intro */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t("static.intro")}
        </p>

        {/* List */}
        {elements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {elements.map((el) => {
              const progression = progressionMap[el.slug];
              return (
                <StaticElementCard
                  key={el.slug}
                  element={el}
                  progression={progression}
                  isLoadingProgression={false}
                  locale={locale}
                  t={t}
                />
              );
            })}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

type TFunc = (key: import("@/lib/i18n").DictKey, vars?: Record<string, string | number>) => string;

function StaticElementCard({
  element,
  progression,
  isLoadingProgression,
  locale,
  t,
}: {
  element: StaticElement;
  progression?: ProgressionState;
  isLoadingProgression: boolean;
  locale: "ru" | "en";
  t: TFunc;
}) {
  const total = element.steps.length;
  const passedCount = progression
    ? progression.passedSteps.filter((n) =>
        element.steps.some((s) => s.order === n),
      ).length
    : 0;
  const currentStep = progression?.currentStep ?? 1;
  const percent = total > 0 ? Math.round((passedCount / total) * 100) : 0;
  const name = elementName(element, locale);

  return (
    <Link
      href={`/knowledge/static/${element.slug}`}
      className="block touch-manipulation"
      aria-label={name}
    >
      <Card className="p-3 gap-3 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <StaticElementIcon
              icon={element.icon}
              className="h-9 w-9 text-primary"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight truncate">
              {name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-snug mt-1">
              {elementDesc(element, locale)}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">
              {t("static.step")} {isLoadingProgression ? "…" : currentStep}{" "}
              {t("static.of")} {total}
            </span>
            <span className="font-medium tabular-nums">
              {passedCount}/{total} {t("static.passed").toLowerCase()}
            </span>
          </div>
          <Progress value={percent} className="h-1.5" />
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
        <Move className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("static.empty")}</p>
    </div>
  );
}

// (ErrorState removed for offline build)
