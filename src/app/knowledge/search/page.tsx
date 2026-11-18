"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
  Brain,
  BookOpen,
  Hash,
  Clock,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TECHNIQUE_CATEGORY_COLORS } from "@/app/knowledge/page";
import type { Technique, TheoryArticle } from "@/lib/types";
import { cn } from "@/lib/utils";

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

function theoryTitle(
  a: Pick<TheoryArticle, "titleRu" | "titleEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? a.titleRu : a.titleEn;
}

function theoryExcerpt(
  a: Pick<TheoryArticle, "contentRu" | "contentEn">,
  locale: "ru" | "en",
): string {
  const content = locale === "ru" ? a.contentRu : a.contentEn;
  const plain = content
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
  const sentences = plain.split(/(?<=[.!?])\s+/).slice(0, 2).join(" ");
  return sentences;
}

// ====== Inner component (consumes useSearchParams) ======

function GlobalSearch() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = React.useState(initialQuery);
  const debouncedQuery = React.useDeferredValue(query);
  const trimmedQuery = debouncedQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  // Sync input -> URL (replace, no history spam)
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    } else {
      params.delete("q");
    }
    const qs = params.toString();
    const next = qs ? `/knowledge/search?${qs}` : "/knowledge/search";
    router.replace(next, { scroll: false });
  }, [trimmedQuery, router, searchParams]);

  const techniquesQuery = useQuery({
    queryKey: ["techniques", "all", trimmedQuery],
    queryFn: async () => {
      if (!trimmedQuery) return [] as Technique[];
      const res = await fetch(
        `/api/techniques?q=${encodeURIComponent(trimmedQuery)}`,
      );
      if (!res.ok) throw new Error("techniques fetch failed");
      return (await res.json()) as Technique[];
    },
    enabled: isSearching,
  });

  const theoryQuery = useQuery({
    queryKey: ["theory", "all", trimmedQuery],
    queryFn: async () => {
      if (!trimmedQuery) return [] as TheoryArticle[];
      const res = await fetch(
        `/api/theory?q=${encodeURIComponent(trimmedQuery)}`,
      );
      if (!res.ok) throw new Error("theory fetch failed");
      return (await res.json()) as TheoryArticle[];
    },
    enabled: isSearching,
  });

  const techniques = techniquesQuery.data ?? [];
  const theory = theoryQuery.data ?? [];

  const isLoading =
    isSearching && (techniquesQuery.isLoading || theoryQuery.isLoading);
  const isError = techniquesQuery.isError || theoryQuery.isError;
  const isEmpty =
    isSearching && !isLoading && !isError && techniques.length === 0 && theory.length === 0;

  return (
    <MobileShell>
      <PageHeader
        title={t("search.results")}
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
        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholderGlobal")}
            className="pl-9 pr-9 h-11 min-h-[44px] rounded-lg"
            inputMode="search"
            autoFocus
            aria-label={t("search.placeholderGlobal")}
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

        {/* States */}
        {!isSearching ? (
          <InitialHint />
        ) : isLoading ? (
          <SkeletonList />
        ) : isError ? (
          <ErrorState
            onRetry={() => {
              techniquesQuery.refetch();
              theoryQuery.refetch();
            }}
          />
        ) : isEmpty ? (
          <SearchEmptyState query={trimmedQuery} />
        ) : (
          <div className="space-y-4 pb-2">
            {/* Techniques section */}
            {techniques.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  {t("search.techniques")}
                  <span className="ml-2 text-muted-foreground/70 normal-case">
                    {techniques.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {techniques.map((tech) => (
                    <TechniqueResult
                      key={tech.slug}
                      technique={tech}
                      locale={locale}
                      t={t}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Theory section */}
            {theory.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                  {t("search.theory")}
                  <span className="ml-2 text-muted-foreground/70 normal-case">
                    {theory.length}
                  </span>
                </h2>
                <div className="space-y-2">
                  {theory.map((article) => (
                    <TheoryResult
                      key={article.slug}
                      article={article}
                      locale={locale}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function TechniqueResult({
  technique,
  locale,
  t,
}: {
  technique: Technique;
  locale: "ru" | "en";
  t: (k: DictKey) => string;
}) {
  const name = techniqueName(technique, locale);
  const desc = techniqueDesc(technique, locale);
  const colors = TECHNIQUE_CATEGORY_COLORS[technique.category];

  return (
    <Link
      href={`/knowledge/techniques/${technique.slug}`}
      className="block touch-manipulation"
      aria-label={name}
    >
      <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight">{name}</h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={cn("border text-[10px]", colors.badge)}
              >
                {t(`tech.category.${technique.category}` as DictKey)}
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

function TheoryResult({
  article,
  locale,
}: {
  article: TheoryArticle;
  locale: "ru" | "en";
}) {
  const title = theoryTitle(article, locale);
  const excerpt = theoryExcerpt(article, locale);

  return (
    <Link
      href={`/knowledge/theory/${article.slug}`}
      className="block touch-manipulation"
      aria-label={title}
    >
      <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight">{title}</h3>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Hash className="h-2.5 w-2.5" />
                  {article.category}
                </Badge>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
        </div>
        {excerpt && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug pl-11">
            {excerpt}
          </p>
        )}
      </Card>
    </Link>
  );
}

function InitialHint() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">
        {t("search.placeholderGlobal")}
      </p>
    </div>
  );
}

function SearchEmptyState({ query }: { query: string }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <Brain className="h-6 w-6 text-muted-foreground" />
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

function SkeletonList() {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-3 gap-2">
            <Skeleton className="h-5 w-2/3" />
            <div className="flex gap-1.5">
              <Skeleton className="h-5 w-14 rounded-md" />
              <Skeleton className="h-5 w-12 rounded-md" />
            </div>
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="p-3 gap-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
        {t("common.retry")}
      </Button>
    </div>
  );
}

// ====== Page wrapper (Suspense required for useSearchParams in Next.js 16) ======

export default function SearchPage() {
  return (
    <React.Suspense
      fallback={
        <MobileShell>
          <PageHeader title="" />
          <div className="flex-1 px-4 py-3 space-y-3">
            <Skeleton className="h-11 w-full rounded-lg" />
          </div>
        </MobileShell>
      }
    >
      <GlobalSearch />
    </React.Suspense>
  );
}
