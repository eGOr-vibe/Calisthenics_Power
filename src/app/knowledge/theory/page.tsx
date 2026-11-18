"use client";

import * as React from "react";
import Link from "next/link";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  Hash,
  Search,
  X,
  Star,
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
import { useToast } from "@/hooks/use-toast";
import type { TheoryArticle } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== API helpers ======

async function fetchFavorites(): Promise<string[]> {
  const res = await fetch("/api/theory/favorites");
  if (!res.ok) throw new Error("favorites fetch failed");
  return (await res.json()) as string[];
}

async function addFavorite(slug: string): Promise<void> {
  const res = await fetch("/api/theory/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  if (!res.ok) throw new Error("favorites add failed");
}

async function removeFavorite(slug: string): Promise<void> {
  const res = await fetch(`/api/theory/favorites/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("favorites remove failed");
}

// ====== Helpers ======

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
  // Strip markdown markers and grab first 2 sentences
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

type Filter = "all" | "favorites";

// ====== Main component ======

export default function TheoryListPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [query, setQuery] = React.useState("");
  const debouncedQuery = React.useDeferredValue(query);
  const trimmedQuery = debouncedQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  const [filter, setFilter] = React.useState<Filter>("all");

  const theoryQuery = useQuery({
    queryKey: ["theory", "all", trimmedQuery],
    queryFn: async () => {
      const url = trimmedQuery
        ? `/api/theory?q=${encodeURIComponent(trimmedQuery)}`
        : "/api/theory";
      const res = await fetch(url);
      if (!res.ok) throw new Error("theory fetch failed");
      return (await res.json()) as TheoryArticle[];
    },
  });

  const favoritesQuery = useQuery({
    queryKey: ["theory", "favorites"],
    queryFn: fetchFavorites,
  });

  const favoriteSlugs = React.useMemo(
    () => new Set(favoritesQuery.data ?? []),
    [favoritesQuery.data],
  );

  const hasAnyFavorite = favoriteSlugs.size > 0;

  // Mutation: toggle favorite (POST or DELETE based on current state)
  const toggleMutation = useMutation({
    mutationFn: async (slug: string) => {
      if (favoriteSlugs.has(slug)) {
        await removeFavorite(slug);
      } else {
        await addFavorite(slug);
      }
    },
    onMutate: async (slug) => {
      await queryClient.cancelQueries({ queryKey: ["theory", "favorites"] });
      const prev = queryClient.getQueryData<string[]>(["theory", "favorites"]);
      const next = prev
        ? favoriteSlugs.has(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug]
        : [slug];
      queryClient.setQueryData<string[]>(["theory", "favorites"], next);
      return { prev };
    },
    onError: (_e, _slug, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData<string[]>(["theory", "favorites"], ctx.prev);
      }
      toast({
        title: t("common.error"),
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["theory", "favorites"] });
    },
  });

  const handleToggle = React.useCallback(
    (slug: string) => {
      const willAdd = !favoriteSlugs.has(slug);
      toggleMutation.mutate(slug);
      toast({
        title: willAdd
          ? t("theory.addedToFavorites")
          : t("theory.removedFromFavorites"),
      });
    },
    [favoriteSlugs, toggleMutation, toast, t],
  );

  const articles = theoryQuery.data ?? [];

  // Filter by favorites if needed
  const visibleArticles = React.useMemo(() => {
    if (filter === "favorites") {
      return articles.filter((a) => favoriteSlugs.has(a.slug));
    }
    return articles;
  }, [articles, filter, favoriteSlugs]);

  return (
    <MobileShell>
      <PageHeader
        title={t("theory.title")}
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

        {/* Favorites filter chips — shown only if there is at least 1 favorite */}
        {hasAnyFavorite && !isSearching && (
          <div className="no-scrollbar -mx-4 px-4 overflow-x-auto">
            <div className="flex items-center gap-2 w-max pb-1">
              <FilterChip
                active={filter === "all"}
                onClick={() => setFilter("all")}
                label={t("theory.filterAll")}
              />
              <FilterChip
                active={filter === "favorites"}
                onClick={() => setFilter("favorites")}
                label={t("theory.filterFavorites")}
                icon={<Star className="h-3.5 w-3.5 fill-current" />}
              />
            </div>
          </div>
        )}

        {theoryQuery.isLoading ? (
          <SkeletonList />
        ) : theoryQuery.isError ? (
          <ErrorState onRetry={() => theoryQuery.refetch()} />
        ) : visibleArticles.length === 0 ? (
          filter === "favorites" && !isSearching ? (
            <NoFavoritesState />
          ) : isSearching ? (
            <SearchEmptyState query={debouncedQuery.trim()} />
          ) : (
            <EmptyState />
          )
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {visibleArticles.map((article, i) => (
              <TheoryCard
                key={article.slug}
                article={article}
                index={i + 1}
                locale={locale}
                t={t}
                isFavorite={favoriteSlugs.has(article.slug)}
                onToggleFavorite={handleToggle}
                pending={toggleMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function FilterChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 h-9 px-3.5 rounded-full text-xs font-medium border transition-colors touch-manipulation min-h-[44px] flex items-center gap-1.5",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-foreground border-border hover:bg-accent/50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function TheoryCard({
  article,
  index,
  locale,
  t,
  isFavorite,
  onToggleFavorite,
  pending,
}: {
  article: TheoryArticle;
  index: number;
  locale: "ru" | "en";
  t: (k: DictKey) => string;
  isFavorite: boolean;
  onToggleFavorite: (slug: string) => void;
  pending: boolean;
}) {
  const title = theoryTitle(article, locale);
  const excerpt = theoryExcerpt(article, locale);

  return (
    <Card className="p-3 gap-2 hover:border-primary/40 hover:bg-accent/40 active:scale-[0.99] transition-all">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/knowledge/theory/${article.slug}`}
          className="flex items-start gap-3 min-w-0 flex-1 touch-manipulation"
          aria-label={title}
        >
          <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center tabular-nums">
            {index}
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
        </Link>
        <div className="flex items-center gap-1 shrink-0">
          <StarButton
            isFavorite={isFavorite}
            pending={pending}
            label={
              isFavorite
                ? t("theory.removeFromFavorites")
                : t("theory.addToFavorites")
            }
            onClick={() => onToggleFavorite(article.slug)}
          />
          <ChevronRight className="h-5 w-5 text-muted-foreground mt-1 pointer-events-none" />
        </div>
      </div>
      {excerpt && (
        <Link
          href={`/knowledge/theory/${article.slug}`}
          className="block touch-manipulation"
          tabIndex={-1}
          aria-hidden
        >
          <p className="text-xs text-muted-foreground line-clamp-2 leading-snug pl-11">
            {excerpt}
          </p>
        </Link>
      )}
    </Card>
  );
}

function StarButton({
  isFavorite,
  pending,
  label,
  onClick,
}: {
  isFavorite: boolean;
  pending: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!pending) onClick();
      }}
      aria-label={label}
      aria-pressed={isFavorite}
      className="h-11 w-11 -mr-1 flex items-center justify-center rounded-md hover:bg-accent/60 active:scale-95 transition touch-manipulation disabled:opacity-50"
      disabled={pending}
    >
      <Star
        className={cn(
          "h-5 w-5 transition-colors",
          isFavorite
            ? "text-amber-500 fill-amber-500"
            : "text-muted-foreground",
        )}
      />
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-3 gap-2">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
            <div className="flex-1 grid grid-cols-2 gap-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-3">
        <BookOpen className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{t("theory.empty")}</p>
    </div>
  );
}

function NoFavoritesState() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
        <Star className="h-6 w-6 text-amber-500" />
      </div>
      <p className="text-sm text-muted-foreground max-w-xs">
        {t("theory.noFavorites")}
      </p>
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
