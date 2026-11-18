"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Quote,
  Star,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

function theoryContent(
  a: Pick<TheoryArticle, "contentRu" | "contentEn">,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? a.contentRu : a.contentEn;
}

// ====== Markdown components ======

const MARKDOWN_COMPONENTS = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl font-bold mt-6 mb-3 leading-tight">{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-bold mt-6 mb-3 leading-tight text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl font-semibold mt-5 mb-2 leading-tight text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-lg font-semibold mt-4 mb-2 leading-tight text-foreground">
      {children}
    </h4>
  ),
  p: ({ children }: any) => (
    <p className="mb-4 leading-relaxed text-foreground/90 text-[15px]">
      {children}
    </p>
  ),
  ul: ({ children }: any) => (
    <ul className="list-disc pl-6 mb-4 space-y-1.5 leading-relaxed text-foreground/90 text-[15px]">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal pl-6 mb-4 space-y-1.5 leading-relaxed text-foreground/90 text-[15px]">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }: any) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-muted-foreground">{children}</em>
  ),
  a: ({ children, href }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:opacity-80 break-words"
    >
      {children}
    </a>
  ),
  code: ({ children }: any) => (
    <code className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono text-foreground">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-muted p-3 rounded-md overflow-x-auto mb-4 text-[13px] leading-relaxed">
      {children}
    </pre>
  ),
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary/40 pl-4 my-4 italic text-muted-foreground leading-relaxed">
      {children}
    </blockquote>
  ),
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-4 -mx-4 px-4">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted/60">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="border border-border px-2 py-1.5 text-left font-semibold text-foreground">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="border border-border px-2 py-1.5 text-foreground/90 align-top">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-border" />,
} as const;

// ====== Main component ======

export default function TheoryArticlePage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const query = useQuery({
    queryKey: ["theory", "all"],
    queryFn: async () => {
      const res = await fetch("/api/theory");
      if (!res.ok) throw new Error("theory fetch failed");
      return (await res.json()) as TheoryArticle[];
    },
  });

  const favoritesQuery = useQuery({
    queryKey: ["theory", "favorites"],
    queryFn: fetchFavorites,
  });

  const isFavorite = Boolean(
    slug && (favoritesQuery.data ?? []).includes(slug),
  );

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!slug) return;
      if (isFavorite) {
        await removeFavorite(slug);
      } else {
        await addFavorite(slug);
      }
    },
    onMutate: async () => {
      if (!slug) return;
      await queryClient.cancelQueries({ queryKey: ["theory", "favorites"] });
      const prev = queryClient.getQueryData<string[]>(["theory", "favorites"]);
      const next = prev
        ? isFavorite
          ? prev.filter((s) => s !== slug)
          : [...prev, slug]
        : [slug];
      queryClient.setQueryData<string[]>(["theory", "favorites"], next);
    },
    onError: () => {
      // rollback
      queryClient.invalidateQueries({ queryKey: ["theory", "favorites"] });
      toast({ title: t("common.error") });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["theory", "favorites"] });
    },
  });

  const article = query.data?.find((x) => x.slug === slug) ?? null;
  const title = article ? theoryTitle(article, locale) : "";

  const handleToggleFavorite = React.useCallback(() => {
    if (!slug) return;
    const willAdd = !isFavorite;
    toggleMutation.mutate();
    toast({
      title: willAdd
        ? t("theory.addedToFavorites")
        : t("theory.removedFromFavorites"),
    });
  }, [slug, isFavorite, toggleMutation, toast, t]);

  const handleAskAI = React.useCallback(() => {
    if (!article) return;
    const articleTitle = theoryTitle(article, locale);
    const prompt =
      locale === "ru"
      ? `Расскажи подробнее про тему "${articleTitle}". Какие ключевые моменты стоит знать атлету-калистенику?`
      : `Tell me more about the topic "${articleTitle}". What are the key points a calisthenics athlete should know?`;
    try {
      sessionStorage.setItem("cp_ai_prefill", prompt);
    } catch {
      // ignore
    }
    router.push("/knowledge/ai");
  }, [article, locale, router]);

  return (
    <MobileShell>
      {/* Sticky header with back button */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border safe-top">
        <div className="flex items-center gap-2 px-2 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label={t("common.back")}
            className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-base leading-tight truncate flex-1 min-w-0">
            {title}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            aria-label={
              isFavorite
                ? t("theory.removeFromFavorites")
                : t("theory.addToFavorites")
            }
            aria-pressed={isFavorite}
            disabled={toggleMutation.isPending}
            className="min-h-[44px] min-w-[44px] h-11 w-11 shrink-0"
          >
            <Star
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorite
                  ? "text-amber-500 fill-amber-500"
                  : "text-muted-foreground",
              )}
            />
          </Button>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-4">
        {query.isLoading ? (
          <SkeletonArticle />
        ) : query.isError || !article ? (
          <ErrorState
            onRetry={() => query.refetch()}
            onBack={() => router.push("/knowledge/theory")}
          />
        ) : (
          <>
            {/* Title block */}
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold leading-tight">
                  {theoryTitle(article, locale)}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  {article.category}
                </p>
              </div>
            </div>

            {/* Markdown content */}
            <article className="max-w-prose">
              <ReactMarkdown components={MARKDOWN_COMPONENTS as any}>
                {theoryContent(article, locale)}
              </ReactMarkdown>
            </article>

            {/* Sources */}
            {article.sources && article.sources.length > 0 && (
              <Card className="p-3 gap-2 border-2 border-primary/40 bg-primary/5">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("theory.sources")}
                  </h3>
                </div>
                <ul className="space-y-1.5 mt-1">
                  {article.sources.map((s, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <Quote className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/70" />
                      <span className="leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Ask AI button */}
            <div className="sticky bottom-24 z-30 px-0 pt-2 pb-2">
              <Button
                variant="default"
                className="w-full h-12 shadow-lg"
                onClick={handleAskAI}
              >
                <Sparkles className="h-5 w-5" />
                <span>{t("ai.askAboutThis")}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function SkeletonArticle() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-5 w-1/2 mt-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  );
}

function ErrorState({
  onRetry,
  onBack,
}: {
  onRetry: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("common.error")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.back")}</span>
        </Button>
        <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
          {t("common.retry")}
        </Button>
      </div>
    </div>
  );
}
