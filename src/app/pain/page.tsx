"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, AlertCircle, Activity } from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface PainEntry {
  id: string;
  bodyPart: string;
  intensity: number;
  type: string | null;
  notes: string | null;
  date: string;
}

const BODY_PARTS: Array<{ id: string; labelKey: string }> = [
  { id: "leftElbow", labelKey: "profile.bodyPart.leftElbow" },
  { id: "rightElbow", labelKey: "profile.bodyPart.rightElbow" },
  { id: "leftShoulder", labelKey: "profile.bodyPart.leftShoulder" },
  { id: "rightShoulder", labelKey: "profile.bodyPart.rightShoulder" },
  { id: "leftWrist", labelKey: "profile.bodyPart.leftWrist" },
  { id: "rightWrist", labelKey: "profile.bodyPart.rightWrist" },
  { id: "lowerBack", labelKey: "profile.bodyPart.lowerBack" },
  { id: "neck", labelKey: "profile.bodyPart.neck" },
  { id: "knees", labelKey: "profile.bodyPart.knees" },
];

function intensityColor(intensity: number): string {
  if (intensity <= 3) return "text-emerald-500";
  if (intensity <= 6) return "text-amber-500";
  return "text-red-500";
}

function intensityBg(intensity: number): string {
  if (intensity <= 3) return "bg-emerald-500/15 border-emerald-500/30";
  if (intensity <= 6) return "bg-amber-500/15 border-amber-500/30";
  return "bg-red-500/15 border-red-500/30";
}

export default function PainTrackerPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    bodyPart: "leftElbow",
    intensity: 5,
    type: "",
    notes: "",
  });

  const painQuery = useQuery({
    queryKey: ["pain-logs"],
    queryFn: async () => {
      const res = await fetch("/api/pain?limit=30");
      if (!res.ok) throw new Error("pain fetch failed");
      return res.json() as Promise<PainEntry[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/pain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bodyPart: data.bodyPart,
          intensity: data.intensity,
          type: data.type.trim() || null,
          notes: data.notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("pain create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pain-logs"] });
      toast({ description: t("pain.saved") });
      setSheetOpen(false);
      setForm({ bodyPart: "leftElbow", intensity: 5, type: "", notes: "" });
    },
    onError: () => {
      toast({ title: t("common.error"), variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/pain/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pain-logs"] });
    },
  });

  const entries = painQuery.data ?? [];

  // Stats
  const avgIntensity =
    entries.length > 0
      ? Math.round(
          (entries.reduce((s, e) => s + e.intensity, 0) / entries.length) * 10,
        ) / 10
      : 0;
  const worstPart = entries.length > 0
    ? entries.reduce((acc, e) => {
        acc[e.bodyPart] = (acc[e.bodyPart] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};
  const topPart = Object.entries(worstPart).sort((a, b) => b[1] - a[1])[0]?.[0];

  const handleSubmit = () => {
    createMutation.mutate(form);
  };

  return (
    <MobileShell>
      <PageHeader title={t("pain.title")} subtitle={t("pain.subtitle")} />

      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Intro */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("pain.intro")}
        </p>

        {/* Stats */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            <Card className="p-2 text-center">
              <div className="text-lg font-bold tabular-nums">{entries.length}</div>
              <div className="text-[9px] text-muted-foreground">{t("pain.totalEntries")}</div>
            </Card>
            <Card className="p-2 text-center">
              <div className={cn("text-lg font-bold tabular-nums", intensityColor(avgIntensity))}>
                {avgIntensity}
              </div>
              <div className="text-[9px] text-muted-foreground">{t("pain.avgIntensity")}</div>
            </Card>
            <Card className="p-2 text-center">
              <div className="text-xs font-bold truncate">
                {topPart ? t(`profile.bodyPart.${topPart}` as DictKey) : "—"}
              </div>
              <div className="text-[9px] text-muted-foreground">{t("pain.topPart")}</div>
            </Card>
          </div>
        )}

        {/* Add button */}
        <Button
          className="w-full h-10"
          onClick={() => setSheetOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t("pain.add")}
        </Button>

        {/* List */}
        {painQuery.isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-3 h-16 animate-pulse bg-muted" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-4 text-center border-dashed">
            <AlertCircle className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{t("pain.empty")}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Card
                key={entry.id}
                className={cn("p-2.5 flex items-center gap-2.5 border", intensityBg(entry.intensity))}
              >
                {/* Intensity number */}
                <div className={cn("text-xl font-bold tabular-nums w-8 text-center", intensityColor(entry.intensity))}>
                  {entry.intensity}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-[9px] h-4 px-1">
                      {t(`profile.bodyPart.${entry.bodyPart}` as DictKey)}
                    </Badge>
                    {entry.type && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {entry.type}
                      </span>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                      {entry.notes}
                    </p>
                  )}
                  <span className="text-[9px] text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                  </span>
                </div>
                {/* Delete */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => deleteMutation.mutate(entry.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="p-0 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-base">{t("pain.add")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-3 space-y-3">
            {/* Body part */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pain.bodyPart")}
              </Label>
              <div className="grid grid-cols-3 gap-1.5">
                {BODY_PARTS.map((bp) => (
                  <button
                    key={bp.id}
                    onClick={() => setForm({ ...form, bodyPart: bp.id })}
                    className={cn(
                      "h-9 rounded-lg border text-[10px] font-medium transition-colors touch-manipulation",
                      form.bodyPart === bp.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    {t(bp.labelKey as DictKey)}
                  </button>
                ))}
              </div>
            </div>
            {/* Intensity */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pain.intensity")}: <span className={cn("font-bold", intensityColor(form.intensity))}>{form.intensity}/10</span>
              </Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setForm({ ...form, intensity: n })}
                    className={cn(
                      "flex-1 h-8 rounded text-xs font-bold tabular-nums transition-colors touch-manipulation",
                      form.intensity === n
                        ? "bg-primary text-primary-foreground"
                        : n <= 3
                        ? "bg-emerald-500/10 text-emerald-500"
                        : n <= 6
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-red-500/10 text-red-500",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pain.type")}
              </Label>
              <Input
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                placeholder={t("pain.typePlaceholder")}
                className="h-10"
              />
            </div>
            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("pain.notes")}
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder={t("pain.notesPlaceholder")}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
          <SheetFooter className="p-4 pt-2">
            <Button
              className="w-full h-10"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {t("common.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}
