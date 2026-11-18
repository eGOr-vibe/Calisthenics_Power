"use client";

import * as React from "react";
import Link from "next/link";
import {
  getTechniques,
} from "@/lib/local-storage";
import {
  ArrowLeft,
  Clock,
  ChevronRight,
  Brain,
  Search,
  X,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Technique, TechniqueCategory, LevelBase } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const CATEGORY_OPTIONS: (TechniqueCategory | "all")[] = [
  "all",
  "cns",
  "mental",
  "relax",
  "warmup",
  "cooldown",
];

const CATEGORY_COLORS: Record<TechniqueCategory, string> = {
  cns: "bg-red-500/15 text-red-500 border-red-500/30",
  mental: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  relax: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  warmup: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  cooldown: "bg-teal-500/15 text-teal-500 border-teal-500/30",
};

const LEVEL_COLORS: Record<LevelBase, string> = {
  beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-500 border-red-500/30",
};

// ====== Helpers ======

function techniqueName(
  t: Pick<Technique, "nameRu" | "nameEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? t.nameRu : t.nameEn;
}

function techniqueDesc(
  t: Pick<Technique, "descriptionRu" | "descriptionEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? t.descriptionRu : t.descriptionEn;
}

// ====== Main component ======

function TechniquesLibrary() {
  const { t, locale } = useI18n();
  const [category, setCategory] = React.useState<TechniqueCategory | "all">(
    "all",
  );
  const [query, setQuery] = React.useState("");
  const debouncedQuery = React.useDeferredValue(query);
  const trimmedQuery = debouncedQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  const techniques = React.useMemo(() => {
    const all = getTechniques(category);
    if (!trimmedQuery) return all;
    const q = trimmedQuery.toLowerCase();
    return all.filter(
      (t) =>
        t.nameRu.toLowerCase().includes(q) ||
        t.nameEn.toLowerCase().includes(q) ||
        t.descriptionRu.toLowerCase().includes(q) ||
        t.descriptionEn.toLowerCase().includes(q),
    );
  }, [category, trimmedQuery]);

  return (
    <MobileShell>
      <PageHeader
        title={t("tech.title")}
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

      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="pl-9 pr-9 h-11 min-h-[44px] rounded-lg"
            inputMode="search"
            aria-label={t("search.placeholder")}
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t("search.placeholder")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground touch-manipulation"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category chips (hidden while searching) */}
        {!isSearching && (
          <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
            <div className="flex items-center gap-2 w-max pb-1">
              {CATEGORY_OPTIONS.map((cat) => (
                <CategoryChip
                  key={cat}
                  active={category === cat}
                  onClick={() => setCategory(cat)}
                  label={cat === "all" ? t("tech.all") : t(`tech.category.${cat}` as DictKey)}
                  color={
                    cat === "all"
                      ? undefined
                      : CATEGORY_COLORS[cat as TechniqueCategory]
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* List */}
        {techniques.length === 0 ? (
          isSearching ? (
            <SearchEmptyState query={trimmedQuery} />
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {techniques.map((tech) => (
              <TechniqueCard key={tech.slug} technique={tech} />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function CategoryChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 h-9 px-3.5 rounded-full text-xs font-medium border transition-colors touch-manipulation min-h-[44px] flex items-center",
        active
          ? color
            ? cn(color, "font-semibold")
            : "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:bg-accent/50",
      )}
    >
      {label}
    </button>
  );
}

function TechniqueCard({ technique }: { technique: Technique }) {
  const { t, locale } = useI18n();
  const name = techniqueName(technique, locale);
  const desc = techniqueDesc(technique, locale);

  return (
    <Link
      href={`/knowledge/techniques/${technique.slug}`}
      className="block touch-manipulation"
      aria-label={name}
    >
      <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight">
              {name}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={cn(
                  "border",
                  CATEGORY_COLORS[technique.category],
                )}
              >
                {t(`tech.category.${technique.category}` as DictKey)}
              </Badge>
              <Badge
                variant="outline"
                className={cn("border", LEVEL_COLORS[technique.level])}
              >
                {t(`level.${technique.level}` as DictKey)}
              </Badge>
              {technique.durationMin ? (
                <Badge
                  variant="outline"
                  className="border-border text-muted-foreground gap-1"
                >
                  <Clock className="h-3 w-3" />
                  <span className="tabular-nums">{technique.durationMin}</span>
                  <span>{t("tech.min")}</span>
                </Badge>
              ) : null}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
        </div>
        {desc && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
            {desc}
          </p>
        )}
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
        <Brain className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("tech.empty")}</p>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        {t("search.empty", { q: query })}
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        {t("search.tryDifferent")}
      </p>
    </div>
  );
}

// (ErrorState removed for offline build)

export default function TechniquesLibraryPage() {
  return <TechniquesLibrary />;
}
