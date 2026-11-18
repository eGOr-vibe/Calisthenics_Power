"use client";

import * as React from "react";
import { Moon, Plus, Trash2, Heart, Activity, Clock } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getSleepLogs, addSleepLog, deleteSleepLog } from "@/lib/local-storage";

export default function SleepPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [entries, setEntries] = React.useState(() => getSleepLogs());
  const [form, setForm] = React.useState({ sleepHours: 7, sleepQuality: 6, hrv: "", rhr: "", bedTime: "", wakeTime: "", notes: "" });

  const avgSleep = entries.length > 0 ? (entries.reduce((s, e) => s + e.sleepHours, 0) / entries.length).toFixed(1) : "—";
  const avgQuality = entries.length > 0 ? (entries.reduce((s, e) => s + e.sleepQuality, 0) / entries.length).toFixed(1) : "—";
  const lastHrv = entries.find(e => e.hrv)?.hrv ?? null;
  const lastRhr = entries.find(e => e.rhr)?.rhr ?? null;

  const handleSubmit = () => {
    addSleepLog({ sleepHours: form.sleepHours, sleepQuality: form.sleepQuality, hrv: form.hrv ? Number(form.hrv) : null, rhr: form.rhr ? Number(form.rhr) : null, bedTime: form.bedTime || null, wakeTime: form.wakeTime || null, notes: form.notes || null });
    setEntries(getSleepLogs());
    toast({ description: t("sleep.saved") });
    setSheetOpen(false);
    setForm({ sleepHours: 7, sleepQuality: 6, hrv: "", rhr: "", bedTime: "", wakeTime: "", notes: "" });
  };

  const handleDelete = (id: string) => { deleteSleepLog(id); setEntries(getSleepLogs()); };

  const hoursColor = (h: number) => h < 6 ? "text-red-500" : h < 7 ? "text-amber-500" : "text-emerald-500";
  const qualityColor = (q: number) => q <= 3 ? "text-red-500" : q <= 6 ? "text-amber-500" : "text-emerald-500";

  return (
    <MobileShell>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-primary" /><h1 className="font-bold text-sm">{t("sleep.title")}</h1></div>
        </div>
      </header>
      <div className="flex-1 px-4 py-3 space-y-3">
        <div className="grid grid-cols-4 gap-1.5">
          <Card className="p-2 text-center"><Moon className="h-3 w-3 text-primary mx-auto mb-0.5" /><div className={cn("text-sm font-bold tabular-nums", hoursColor(Number(avgSleep)))}>{avgSleep}</div><div className="text-[8px] text-muted-foreground">ч</div></Card>
          <Card className="p-2 text-center"><Activity className="h-3 w-3 text-primary mx-auto mb-0.5" /><div className={cn("text-sm font-bold tabular-nums", qualityColor(Number(avgQuality)))}>{avgQuality}</div><div className="text-[8px] text-muted-foreground">кач</div></Card>
          <Card className="p-2 text-center"><Heart className="h-3 w-3 text-primary mx-auto mb-0.5" /><div className="text-sm font-bold tabular-nums">{lastHrv ?? "—"}</div><div className="text-[8px] text-muted-foreground">HRV</div></Card>
          <Card className="p-2 text-center"><Activity className="h-3 w-3 text-primary mx-auto mb-0.5" /><div className="text-sm font-bold tabular-nums">{lastRhr ?? "—"}</div><div className="text-[8px] text-muted-foreground">RHR</div></Card>
        </div>
        <Button className="w-full h-9" onClick={() => setSheetOpen(true)}><Plus className="h-4 w-4" />{t("sleep.add")}</Button>
        {entries.length === 0 ? (
          <Card className="p-4 text-center border-dashed"><Moon className="h-6 w-6 text-muted-foreground mx-auto mb-1" /><p className="text-xs text-muted-foreground">{t("sleep.empty")}</p></Card>
        ) : (
          <div className="space-y-1.5">
            {entries.map(e => (
              <Card key={e.id} className="p-2.5 flex items-center gap-2">
                <div className={cn("text-lg font-bold tabular-nums w-10 text-center", hoursColor(e.sleepHours))}>{e.sleepHours.toFixed(1)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={cn("text-[9px] h-4 px-1", qualityColor(e.sleepQuality))}>{e.sleepQuality}/10</Badge>
                    {e.hrv && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{e.hrv}ms</span>}
                    {e.rhr && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Activity className="h-2.5 w-2.5" />{e.rhr}</span>}
                  </div>
                  {e.notes && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{e.notes}</p>}
                  <span className="text-[9px] text-muted-foreground">{new Date(e.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5 text-muted-foreground" /></Button>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="p-0 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="p-4 pb-2"><SheetTitle className="text-base">{t("sleep.add")}</SheetTitle></SheetHeader>
          <div className="px-4 py-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("sleep.hours")}: <span className={cn("font-bold", hoursColor(form.sleepHours))}>{form.sleepHours.toFixed(1)}ч</span></Label>
              <input type="range" min={0} max={12} step={0.5} value={form.sleepHours} onChange={e => setForm({ ...form, sleepHours: Number(e.target.value) })} className="w-full h-2 accent-primary" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("sleep.quality")}: <span className={cn("font-bold", qualityColor(form.sleepQuality))}>{form.sleepQuality}/10</span></Label>
              <div className="flex gap-1">{[1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} onClick={() => setForm({ ...form, sleepQuality: n })} className={cn("flex-1 h-7 rounded text-[10px] font-bold tabular-nums", form.sleepQuality === n ? "bg-primary text-primary-foreground" : n <= 3 ? "bg-red-500/10 text-red-500" : n <= 6 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>{n}</button>
              ))}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-[9px] text-muted-foreground flex items-center gap-1"><Heart className="h-2.5 w-2.5" /> HRV (ms)</Label><Input type="number" value={form.hrv} onChange={e => setForm({ ...form, hrv: e.target.value })} placeholder="45" className="h-9" /></div>
              <div className="space-y-1"><Label className="text-[9px] text-muted-foreground flex items-center gap-1"><Activity className="h-2.5 w-2.5" /> RHR (bpm)</Label><Input type="number" value={form.rhr} onChange={e => setForm({ ...form, rhr: e.target.value })} placeholder="55" className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {t("sleep.bedTime")}</Label><Input type="time" value={form.bedTime} onChange={e => setForm({ ...form, bedTime: e.target.value })} className="h-9" /></div>
              <div className="space-y-1"><Label className="text-[9px] text-muted-foreground flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {t("sleep.wakeTime")}</Label><Input type="time" value={form.wakeTime} onChange={e => setForm({ ...form, wakeTime: e.target.value })} className="h-9" /></div>
            </div>
            <div className="space-y-1"><Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("sleep.notes")}</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t("sleep.notesPlaceholder")} rows={2} className="resize-none" /></div>
          </div>
          <SheetFooter className="p-4 pt-2"><Button className="w-full h-9" onClick={handleSubmit}>{t("common.save")}</Button></SheetFooter>
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}
