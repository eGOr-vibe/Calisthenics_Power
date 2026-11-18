"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getExercises } from "@/lib/local-storage";
import type { Exercise, ExerciseType, Equipment, LevelBase } from "@/lib/types";

const TYPE_OPTIONS: ExerciseType[] = ["pull", "push", "core", "legs", "static", "mobility"];
const EQUIPMENT_OPTIONS: Equipment[] = ["bar", "dips", "floor", "parallettes", "none", "wall", "rings", "bands", "weighted"];
const LEVEL_OPTIONS: LevelBase[] = ["beginner", "intermediate", "advanced"];

const TYPE_COLORS: Record<ExerciseType, string> = {
  pull: "bg-red-500/15 text-red-500 border-red-500/30",
  push: "bg-orange-500/15 text-orange-500 border-orange-500/30",
  core: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  legs: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  static: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  mobility: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

const LEVEL_COLORS: Record<LevelBase, string> = {
  beginner: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  intermediate: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  advanced: "bg-red-500/15 text-red-500 border-red-500/30",
};

function loadCoefColor(coef: number): string {
  if (coef <= 2) return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
  if (coef <= 5) return "bg-amber-500/15 text-amber-500 border-amber-500/30";
  return "bg-red-500/15 text-red-500 border-red-500/30";
}


export default function ExercisesPage() {
  const { t, locale } = useI18n();
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [equipFilter, setEquipFilter] = React.useState<string>("all");
  const [levelFilter, setLevelFilter] = React.useState<string>("all");
  const [showFilters, setShowFilters] = React.useState(false);

  const allExercises = React.useMemo(() => getExercises(), []);

  const filtered = React.useMemo(() => {
    let result = allExercises;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.nameRu.toLowerCase().includes(q) ||
        e.nameEn.toLowerCase().includes(q) ||
        e.targetMusclesRu.some(m => m.toLowerCase().includes(q)) ||
        e.targetMusclesEn.some(m => m.toLowerCase().includes(q))
      );
    }
    if (typeFilter !== "all") result = result.filter(e => e.type === typeFilter);
    if (equipFilter !== "all") result = result.filter(e => e.equipment.includes(equipFilter as Equipment));
    if (levelFilter !== "all") result = result.filter(e => e.levelBase === levelFilter);
    return result;
  }, [allExercises, search, typeFilter, equipFilter, levelFilter]);

  const hasActiveFilters = typeFilter !== "all" || equipFilter !== "all" || levelFilter !== "all";

  return (
    <MobileShell>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <h1 className="font-bold text-sm">{t("ex.title")}</h1>
          <div className="flex items-center gap-2">
            {hasActiveFilters && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setTypeFilter("all"); setEquipFilter("all"); setLevelFilter("all"); }}><X className="h-4 w-4" /></Button>}
            <Badge variant="secondary" className="text-[10px]">{filtered.length}</Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("ex.search")} className="pl-9 h-9 text-sm" />
          </div>
        </div>
        <div className="flex gap-1.5 px-4 pb-2 overflow-x-auto no-scrollbar">
          <button onClick={() => setTypeFilter("all")} className={cn("px-2.5 h-7 rounded-full text-[10px] font-medium border whitespace-nowrap", typeFilter === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{t("ex.filter.all")}</button>
          {TYPE_OPTIONS.map(tp => (
            <button key={tp} onClick={() => setTypeFilter(tp)} className={cn("px-2.5 h-7 rounded-full text-[10px] font-medium border whitespace-nowrap", typeFilter === tp ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{t(`ex.type.${tp}` as DictKey)}</button>
          ))}
        </div>
      </header>

      <div className="flex-1 px-4 py-3">
        {filtered.length === 0 ? (
          <Card className="p-6 text-center border-dashed"><p className="text-sm text-muted-foreground">{t("ex.empty")}</p></Card>
        ) : (
          <div className="grid grid-cols-2 gap-2 pb-2">
            {filtered.map(ex => {
              const name = locale === "ru" ? ex.nameRu : ex.nameEn;
              const muscles = locale === "ru" ? ex.targetMusclesRu : ex.targetMusclesEn;
              return (
                <Link key={ex.slug} href={`/exercises/${ex.slug}/`} className="touch-manipulation">
                  <Card className="p-2.5 gap-1.5 hover:border-primary/40 active:scale-[0.98] transition-all cursor-pointer h-full min-h-[100px] flex flex-col">
                    <h3 className="font-semibold text-xs leading-tight line-clamp-2 min-h-[2rem]">{name}</h3>
                    <div className="flex flex-wrap items-center gap-1 mt-auto">
                      <Badge variant="outline" className={cn("border text-[9px] h-4 px-1", TYPE_COLORS[ex.type])}>{t(`ex.type.${ex.type}` as DictKey)}</Badge>
                      <Badge variant="outline" className={cn("border text-[9px] h-4 px-1 font-bold tabular-nums", loadCoefColor(ex.loadCoef))}>K{ex.loadCoef}</Badge>
                    </div>
                    {muscles.length > 0 && <p className="text-[9px] text-muted-foreground truncate">{muscles.slice(0, 2).join(" · ")}</p>}
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="p-4 pb-2"><SheetTitle className="text-base">{t("ex.filter.type")}</SheetTitle></SheetHeader>
          <div className="px-4 py-2 space-y-3">
            <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("ex.filter.equipment")}</label>
              <Select value={equipFilter} onValueChange={setEquipFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{EQUIPMENT_OPTIONS.map(eq => <SelectItem key={eq} value={eq}>{t(`eq.${eq}` as DictKey)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("ex.filter.level")}</label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map(lv => <SelectItem key={lv} value={lv}>{t(`level.${lv}` as DictKey)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <SheetFooter className="p-4 pt-2"><Button className="w-full h-9" onClick={() => setShowFilters(false)}>{t("common.close")}</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}
