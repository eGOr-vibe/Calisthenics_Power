"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  getSupplement,
  getSupplements,
} from "@/lib/local-storage";
import type { Supplement } from "@/lib/types";
import {
  ArrowLeft,
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
  Clock,
  Scale,
  Stethoscope,
  BookOpen,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SupplementEfficacy } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Static params for static export ======


// ====== Constants ======

const CATEGORY_META: Record<
  string,
  { badge: string; bg: string; text: string; icon: React.ReactNode }
> = {
  strength: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    bg: "bg-red-500/15",
    text: "text-red-500",
    icon: <Dumbbell className="h-7 w-7" />,
  },
  recovery: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    bg: "bg-emerald-500/15",
    text: "text-emerald-500",
    icon: <HeartPulse className="h-7 w-7" />,
  },
  joints: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    bg: "bg-amber-500/15",
    text: "text-amber-500",
    icon: <Bone className="h-7 w-7" />,
  },
  energy: {
    badge: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
    bg: "bg-yellow-500/15",
    text: "text-yellow-500",
    icon: <Zap className="h-7 w-7" />,
  },
  sleep: {
    badge: "bg-teal-500/15 text-teal-500 border-teal-500/30",
    bg: "bg-teal-500/15",
    text: "text-teal-500",
    icon: <Moon className="h-7 w-7" />,
  },
  vitamins: {
    badge: "bg-purple-500/15 text-purple-500 border-purple-500/30",
    bg: "bg-purple-500/15",
    text: "text-purple-500",
    icon: <Apple className="h-7 w-7" />,
  },
};

const EFFICACY_META: Record<
  SupplementEfficacy,
  { badge: string; icon: React.ReactNode }
> = {
  validated: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  mixed: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/30",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  ineffective: {
    badge: "bg-red-500/15 text-red-500 border-red-500/30",
    icon: <XCircle className="h-4 w-4" />,
  },
};

// ====== Helpers ======

function pickLocalized<T extends { Ru: string; En: string }>(
  obj: T,
  locale: "ru" | "en",
): string {
  return locale === "ru" ? obj.Ru : obj.En;
}

// ====== Main component ======

export default function SupplementDetailClient({ slug }: { slug: string }) {
  const { t, locale } = useI18n();
  const router = useRouter();

  const supplement = React.useMemo<Supplement | null>(() => getSupplement(slug) ?? null, [slug]);

  const meta = supplement
    ? CATEGORY_META[supplement.category] ?? CATEGORY_META.strength
    : CATEGORY_META.strength;
  const eff = supplement
    ? EFFICACY_META[supplement.efficacy] ?? EFFICACY_META.mixed
    : EFFICACY_META.mixed;

  const name = supplement ? pickLocalized({ Ru: supplement.nameRu, En: supplement.nameEn }, locale) : "";
  const description = supplement ? pickLocalized({ Ru: supplement.descriptionRu, En: supplement.descriptionEn }, locale) : "";
  const dosage = supplement ? pickLocalized({ Ru: supplement.dosageRu, En: supplement.dosageEn }, locale) : "";
  const timing = supplement ? pickLocalized({ Ru: supplement.timingRu, En: supplement.timingEn }, locale) : "";
  const efficacyNotes = supplement ? pickLocalized({ Ru: supplement.efficacyNotesRu, En: supplement.efficacyNotesEn }, locale) : "";
  const sideEffects = supplement ? pickLocalized({ Ru: supplement.sideEffectsRu, En: supplement.sideEffectsEn }, locale) : "";
  const contraindications = supplement ? pickLocalized({ Ru: supplement.contraindicationsRu, En: supplement.contraindicationsEn }, locale) : "";

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
            {name}
          </h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-4">
        {!supplement ? (
          <ErrorState onBack={() => router.push("/supplements")} />
        ) : (
          <>
            {/* Hero block with icon */}
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0",
                  meta.bg,
                  meta.text,
                )}
              >
                {meta.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold leading-tight">{name}</h2>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <Badge
                    variant="outline"
                    className={cn("border", meta.badge)}
                  >
                    {t(`supplements.category.${supplement.category}` as DictKey)}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("border inline-flex items-center gap-1", eff.badge)}
                  >
                    {eff.icon}
                    <span>{t(`supplements.efficacy.${supplement.efficacy}` as DictKey)}</span>
                  </Badge>
                </div>
              </div>
            </div>

            {/* Description */}
            {description.trim() !== "" && (
              <Section title="">
                <p className="text-sm leading-relaxed text-foreground/90">
                  {description}
                </p>
              </Section>
            )}

            {/* Dosage */}
            {dosage.trim() !== "" && (
              <Section
                icon={<Scale className="h-4 w-4 text-sky-500" />}
                title={t("supplements.dosage")}
              >
                <Card className="p-3 border-sky-500/30 bg-sky-500/5">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {dosage}
                  </p>
                </Card>
              </Section>
            )}

            {/* Timing */}
            {timing.trim() !== "" && (
              <Section
                icon={<Clock className="h-4 w-4 text-purple-500" />}
                title={t("supplements.timing")}
              >
                <Card className="p-3 border-purple-500/30 bg-purple-500/5">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {timing}
                  </p>
                </Card>
              </Section>
            )}

            {/* Efficacy notes */}
            {efficacyNotes.trim() !== "" && (
              <Section
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                title={t("supplements.efficacyNotes")}
              >
                <Card className="p-3 border-emerald-500/30 bg-emerald-500/5">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {efficacyNotes}
                  </p>
                </Card>
              </Section>
            )}

            {/* Side effects */}
            {sideEffects.trim() !== "" && (
              <Section
                icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                title={t("supplements.sideEffects")}
              >
                <Card className="p-3 border-2 border-amber-500/40 bg-amber-500/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed text-foreground/90 flex-1">
                      {sideEffects}
                    </p>
                  </div>
                </Card>
              </Section>
            )}

            {/* Contraindications */}
            {contraindications.trim() !== "" && (
              <Section
                icon={<XCircle className="h-4 w-4 text-destructive" />}
                title={t("supplements.contraindications")}
              >
                <Card className="p-3 border-2 border-destructive/50 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm leading-relaxed text-foreground/90 flex-1">
                      {contraindications}
                    </p>
                  </div>
                </Card>
              </Section>
            )}

            {/* Sources */}
            {supplement.sources.length > 0 && (
              <Section
                icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
                title={t("supplements.sources")}
              >
                <ul className="space-y-1.5">
                  {supplement.sources.map((src, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-foreground/80"
                    >
                      <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-muted-foreground mt-2" />
                      <span className="leading-relaxed">{src}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Footer: doctor note */}
            <Section
              icon={<Stethoscope className="h-4 w-4 text-destructive" />}
              title=""
            >
              <Card className="p-3 border-2 border-destructive/40 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed text-foreground/90 flex-1 font-medium">
                    {t("supplements.doctorNote")}
                  </p>
                </div>
              </Card>
            </Section>
          </>
        )}
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

function Section({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && <SectionHeader icon={icon} title={title} />}
      {children}
    </section>
  );
}

function SectionHeader({
  icon,
  title,
}: {
  icon?: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon ?? <span className="w-1 h-4 bg-primary rounded-full" />}
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

// (SkeletonDetail removed for offline build)

function ErrorState({
  onBack,
}: {
  onBack: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertTriangle className="h-8 w-8 text-destructive mb-3" />
      <p className="text-sm text-muted-foreground mb-4">{t("supplements.notFound")}</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBack} className="min-h-[44px]">
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.back")}</span>
        </Button>
      </div>
    </div>
  );
}
