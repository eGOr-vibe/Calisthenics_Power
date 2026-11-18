"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Pencil,
  Check,
  Plus,
  Trash2,
  Settings,
  Activity,
  Heart,
  Moon,
  Smile,
  Zap,
  AlertTriangle,
  Calendar,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { calcStressIndex, stressIndexLabel } from "@/lib/biomech";
import { calcMenstrualCycle } from "@/lib/menstrual-cycle";
import type { MenstrualPhase } from "@/lib/menstrual-cycle";
import type { AthleteProfile, Injury, BodyPart, Gender, Vector } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FieldInfo } from "@/components/profile/field-info";

// ====== Constants ======

const MENSTRUAL_PHASE_BADGE: Record<MenstrualPhase, string> = {
  menstrual: "bg-red-500/15 text-red-500 border-red-500/30",
  follicular: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  ovulation: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  luteal: "bg-slate-500/15 text-slate-300 border-slate-500/30",
};

const BODY_PARTS: BodyPart[] = [
  "leftElbow",
  "rightElbow",
  "leftShoulder",
  "rightShoulder",
  "leftWrist",
  "rightWrist",
  "lowerBack",
  "neck",
  "knees",
];

const GENDERS: Gender[] = ["male", "female", "other"];
const VECTORS: Vector[] = ["reps", "static", "cut"];

// Список полей антропометрии/максимумов для отображения
const ANTHRO_NUMBER_FIELDS = [
  "heightCm",
  "weightKg",
  "armLengthCm",
  "torsoLengthCm",
  "legLengthCm",
] as const;

const MAX_FIELDS = [
  "maxPullups",
  "maxPushups",
  "maxDips",
  "maxSquats",
  "maxPlankSec",
] as const;

// Поля, для которых есть подсказка "Как измерять?".
// Рост/вес считаются очевидными — без info-иконки.
const HOW_TO_MEASURE_KEYS: Record<string, DictKey> = {
  armLengthCm: "profile.howToMeasure.armLength",
  torsoLengthCm: "profile.howToMeasure.torsoLength",
  legLengthCm: "profile.howToMeasure.legLength",
  maxPullups: "profile.howToMeasure.maxPullups",
  maxPushups: "profile.howToMeasure.maxPushups",
  maxDips: "profile.howToMeasure.maxDips",
  maxSquats: "profile.howToMeasure.maxSquats",
  maxPlankSec: "profile.howToMeasure.maxPlank",
};

// ====== Local form type (everything string for input handling) ======

type ProfileForm = {
  name: string;
  birthDate: string;
  gender: Gender | "";
  heightCm: string;
  weightKg: string;
  armLengthCm: string;
  torsoLengthCm: string;
  legLengthCm: string;
  maxPullups: string;
  maxPushups: string;
  maxDips: string;
  maxSquats: string;
  maxPlankSec: string;
  primaryVector: Vector | "";
};

type StressForm = {
  sleepHours: number;
  mood: number;
  soreness: number;
};

// ====== Helpers ======

function toForm(p: AthleteProfile | null | undefined): ProfileForm {
  if (!p) {
    return {
      name: "",
      birthDate: "",
      gender: "",
      heightCm: "",
      weightKg: "",
      armLengthCm: "",
      torsoLengthCm: "",
      legLengthCm: "",
      maxPullups: "",
      maxPushups: "",
      maxDips: "",
      maxSquats: "",
      maxPlankSec: "",
      primaryVector: "",
    };
  }
  return {
    name: p.name ?? "",
    birthDate: p.birthDate ? p.birthDate.slice(0, 10) : "",
    gender: p.gender ?? "",
    heightCm: p.heightCm?.toString() ?? "",
    weightKg: p.weightKg?.toString() ?? "",
    armLengthCm: p.armLengthCm?.toString() ?? "",
    torsoLengthCm: p.torsoLengthCm?.toString() ?? "",
    legLengthCm: p.legLengthCm?.toString() ?? "",
    maxPullups: p.maxPullups?.toString() ?? "",
    maxPushups: p.maxPushups?.toString() ?? "",
    maxDips: p.maxDips?.toString() ?? "",
    maxSquats: p.maxSquats?.toString() ?? "",
    maxPlankSec: p.maxPlankSec?.toString() ?? "",
    primaryVector: p.primaryVector ?? "",
  };
}

function numOrNull(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n;
}

function buildPayload(form: ProfileForm, extra?: Record<string, unknown>) {
  return {
    name: form.name.trim() || null,
    birthDate: form.birthDate || null,
    gender: form.gender || null,
    heightCm: numOrNull(form.heightCm),
    weightKg: numOrNull(form.weightKg),
    armLengthCm: numOrNull(form.armLengthCm),
    torsoLengthCm: numOrNull(form.torsoLengthCm),
    legLengthCm: numOrNull(form.legLengthCm),
    maxPullups: numOrNull(form.maxPullups),
    maxPushups: numOrNull(form.maxPushups),
    maxDips: numOrNull(form.maxDips),
    maxSquats: numOrNull(form.maxSquats),
    maxPlankSec: numOrNull(form.maxPlankSec),
    primaryVector: form.primaryVector || null,
    ...extra,
  };
}

function formatDateTime(iso: string | null, locale: "ru" | "en"): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ====== Main page ======

export default function ProfilePage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // --- Data ---
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) {
        throw new Error("profile fetch failed");
      }
      return (await res.json()) as AthleteProfile;
    },
  });

  const injuriesQuery = useQuery({
    queryKey: ["injuries"],
    queryFn: async () => {
      const res = await fetch("/api/injuries");
      if (!res.ok) {
        throw new Error("injuries fetch failed");
      }
      return (await res.json()) as Injury[];
    },
  });

  // --- Edit mode ---
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState<ProfileForm>(toForm(undefined));

  // Sync form from server data when not editing
  React.useEffect(() => {
    if (!isEditing && profileQuery.data) {
      setForm(toForm(profileQuery.data));
    }
  }, [profileQuery.data, isEditing]);

  // --- Stress form (always interactive, separate from main edit mode) ---
  const [stressForm, setStressForm] = React.useState<StressForm>({
    sleepHours: 7,
    mood: 7,
    soreness: 3,
  });

  React.useEffect(() => {
    if (profileQuery.data) {
      setStressForm({
        sleepHours: profileQuery.data.lastSleepHours ?? 7,
        mood: profileQuery.data.lastMood ?? 7,
        soreness: profileQuery.data.lastSoreness ?? 3,
      });
    }
  }, [profileQuery.data]);

  // --- Mutations ---
  const saveProfileMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("profile save failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: t("profile.saved") });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  const recalcStressMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("stress recalc failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  // --- Injury dialog ---
  const [injuryDialogOpen, setInjuryDialogOpen] = React.useState(false);
  const [injuryForm, setInjuryForm] = React.useState<{
    bodyPart: BodyPart;
    type: string;
    severity: number;
    notes: string;
  }>({
    bodyPart: "leftElbow",
    type: "",
    severity: 3,
    notes: "",
  });

  const createInjuryMutation = useMutation({
    mutationFn: async (payload: {
      bodyPart: BodyPart;
      type: string;
      severity: number;
      notes: string | null;
      active: boolean;
    }) => {
      const res = await fetch("/api/injuries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("injury create failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries"] });
      setInjuryDialogOpen(false);
      setInjuryForm({
        bodyPart: "leftElbow",
        type: "",
        severity: 3,
        notes: "",
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  const deleteInjuryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/injuries/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("injury delete failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["injuries"] });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  // --- Derived state ---
  const profile = profileQuery.data;
  const stressIdx = profile?.lastStressIndex ?? null;
  const stress = stressIndexLabel(stressIdx, locale);

  // --- Menstrual cycle dialog (Phase 3: female only) ---
  const [menstrualDialogOpen, setMenstrualDialogOpen] = React.useState(false);
  const [menstrualDate, setMenstrualDate] = React.useState<string>("");

  // Sync dialog date input from server data on open
  React.useEffect(() => {
    if (menstrualDialogOpen && profile?.lastMenstrualDate) {
      setMenstrualDate(profile.lastMenstrualDate.slice(0, 10));
    } else if (menstrualDialogOpen && !profile?.lastMenstrualDate) {
      setMenstrualDate("");
    }
  }, [menstrualDialogOpen, profile?.lastMenstrualDate]);

  const saveMenstrualDateMutation = useMutation({
    mutationFn: async (payload: { lastMenstrualDate: string | null }) => {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("menstrual date save failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["biomech", "summary"] });
      setMenstrualDialogOpen(false);
      toast({ title: t("menstrual.saved") });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    },
  });

  const handleSaveMenstrualDate = () => {
    if (!menstrualDate) return;
    saveMenstrualDateMutation.mutate({ lastMenstrualDate: menstrualDate });
  };

  const stressZoneColor =
    stress.zone === "low"
      ? "text-emerald-500"
      : stress.zone === "medium"
        ? "text-amber-500"
        : "text-red-500";

  const stressCardBorder =
    stress.zone === "low"
      ? "border-emerald-500/40"
      : stress.zone === "medium"
        ? "border-amber-500/40"
        : "border-red-500/40";

  const stressZoneBg =
    stress.zone === "low"
      ? "bg-emerald-500/10"
      : stress.zone === "medium"
        ? "bg-amber-500/10"
        : "bg-red-500/10";

  const stressZoneDesc =
    stress.zone === "low"
      ? t("home.stressIndex.low")
      : stress.zone === "medium"
        ? t("home.stressIndex.medium")
        : t("home.stressIndex.high");

  // Preview stress from current slider values (live)
  const previewStressIdx = calcStressIndex(
    stressForm.sleepHours,
    stressForm.mood,
    stressForm.soreness,
  );
  const previewStress = stressIndexLabel(previewStressIdx, locale);

  const isLoading = profileQuery.isLoading;
  const injuries = injuriesQuery.data ?? [];

  // --- Handlers ---
  const handleSaveProfile = () => {
    saveProfileMutation.mutate(buildPayload(form));
  };

  const handleRecalcStress = () => {
    const newIdx = calcStressIndex(
      stressForm.sleepHours,
      stressForm.mood,
      stressForm.soreness,
    );
    recalcStressMutation.mutate({
      lastSleepHours: stressForm.sleepHours,
      lastMood: stressForm.mood,
      lastSoreness: stressForm.soreness,
      lastStressIndex: newIdx,
      lastStressUpdated: new Date().toISOString(),
    });
  };

  const handleAddInjury = () => {
    if (!injuryForm.type.trim()) {
      toast({
        title: t("common.error"),
        description: t("profile.injuryType"),
        variant: "destructive",
      });
      return;
    }
    createInjuryMutation.mutate({
      bodyPart: injuryForm.bodyPart,
      type: injuryForm.type.trim(),
      severity: injuryForm.severity,
      notes: injuryForm.notes.trim() || null,
      active: true,
    });
  };

  const handleDeleteInjury = (id: string) => {
    deleteInjuryMutation.mutate(id);
  };

  // --- Render helpers ---

  const updateField = <K extends keyof ProfileForm>(
    key: K,
    value: ProfileForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Loading state
  if (isLoading) {
    return (
      <MobileShell>
        <PageHeader title={t("profile.title")} />
        <div className="flex-1 px-4 py-4 space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </MobileShell>
    );
  }

  // Error state
  if (profileQuery.isError) {
    return (
      <MobileShell>
        <PageHeader title={t("profile.title")} />
        <div className="flex-1 px-4 py-4">
          <Card className="p-3 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              {t("common.error")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => profileQuery.refetch()}
            >
              {t("common.retry")}
            </Button>
          </Card>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <PageHeader
        title={t("profile.title")}
        right={
          <Button
            variant={isEditing ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (isEditing) {
                handleSaveProfile();
              } else {
                setForm(toForm(profile));
                setIsEditing(true);
              }
            }}
            disabled={saveProfileMutation.isPending}
            className="min-h-[40px]"
          >
            {isEditing ? (
              <>
                <Check className="h-4 w-4" />
                <span>{t("profile.save")}</span>
              </>
            ) : (
              <>
                <Pencil className="h-4 w-4" />
                <span>{t("profile.edit")}</span>
              </>
            )}
          </Button>
        }
      />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* ====== A. Антропометрия ====== */}
        <Card className="p-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("profile.anthropometry")}
            </span>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" className="text-xs text-muted-foreground">
              {t("profile.name")}
            </Label>
            {isEditing ? (
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder={t("profile.name")}
                className="h-11"
              />
            ) : (
              <div className="font-medium text-base min-h-[28px] flex items-center">
                {profile?.name || <span className="text-muted-foreground">—</span>}
              </div>
            )}
          </div>

          {/* Birth date */}
          <div className="space-y-1.5">
            <Label htmlFor="profile-birth" className="text-xs text-muted-foreground">
              {t("profile.birthDate")}
            </Label>
            {isEditing ? (
              <Input
                id="profile-birth"
                type="date"
                value={form.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
                className="h-11"
              />
            ) : (
              <div className="font-medium text-base min-h-[28px] flex items-center">
                {profile?.birthDate
                  ? formatDateTime(profile.birthDate, locale).split(",")[0]
                  : <span className="text-muted-foreground">—</span>}
              </div>
            )}
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("profile.gender")}
            </Label>
            {isEditing ? (
              <Select
                value={form.gender}
                onValueChange={(v) => updateField("gender", v as Gender)}
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder={t("profile.gender")} />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {t(`profile.gender.${g}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="font-medium text-base min-h-[28px] flex items-center">
                {profile?.gender
                  ? t(`profile.gender.${profile.gender}` as DictKey)
                  : <span className="text-muted-foreground">—</span>}
              </div>
            )}
          </div>

          {/* Number fields: height/weight + limbs */}
          <div className="grid grid-cols-2 gap-3">
            {ANTHRO_NUMBER_FIELDS.map((field) => {
              const labelKey =
                field === "heightCm"
                  ? "profile.height"
                  : field === "weightKg"
                    ? "profile.weight"
                    : field === "armLengthCm"
                      ? "profile.armLength"
                      : field === "torsoLengthCm"
                        ? "profile.torsoLength"
                        : "profile.legLength";
              const howToKey = HOW_TO_MEASURE_KEYS[field];
              const profileValue = profile
                ? (profile[field] as number | null)
                : null;
              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground">
                      {t(labelKey as DictKey)}
                    </Label>
                    {howToKey && (
                      <FieldInfo
                        text={t(howToKey)}
                        ariaLabel={t("profile.howToMeasure.title")}
                      />
                    )}
                  </div>
                  {isEditing ? (
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={form[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="h-11"
                    />
                  ) : (
                    <div className="font-medium text-base min-h-[28px] flex items-center">
                      {profileValue !== null && profileValue !== undefined
                        ? profileValue
                        : <span className="text-muted-foreground">—</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ====== B. Максимумы ====== */}
        <Card className="p-3 gap-2">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("profile.maxStats")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MAX_FIELDS.map((field) => {
              const labelKey =
                field === "maxPullups"
                  ? "profile.maxPullups"
                  : field === "maxPushups"
                    ? "profile.maxPushups"
                    : field === "maxDips"
                      ? "profile.maxDips"
                      : field === "maxSquats"
                        ? "profile.maxSquats"
                        : "profile.maxPlank";
              const howToKey = HOW_TO_MEASURE_KEYS[field];
              const profileValue = profile
                ? (profile[field] as number | null)
                : null;
              return (
                <div key={field} className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <Label className="text-xs text-muted-foreground">
                      {t(labelKey as DictKey)}
                    </Label>
                    {howToKey && (
                      <FieldInfo
                        text={t(howToKey)}
                        ariaLabel={t("profile.howToMeasure.title")}
                      />
                    )}
                  </div>
                  {isEditing ? (
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={form[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="h-11"
                    />
                  ) : (
                    <div className="font-medium text-base min-h-[28px] flex items-center">
                      {profileValue !== null && profileValue !== undefined
                        ? profileValue
                        : <span className="text-muted-foreground">—</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* ====== C. Вектор развития ====== */}
        <Card className="p-3 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("profile.vector")}
            </span>
          </div>
          {isEditing ? (
            <Select
              value={form.primaryVector}
              onValueChange={(v) => updateField("primaryVector", v as Vector)}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder={t("profile.vector")} />
              </SelectTrigger>
              <SelectContent>
                {VECTORS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {t(`profile.vector.${v}` as DictKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="font-medium text-base min-h-[28px] flex items-center">
              {profile?.primaryVector
                ? t(`profile.vector.${profile.primaryVector}` as DictKey)
                : <span className="text-muted-foreground">—</span>}
            </div>
          )}
        </Card>

        {/* ====== D. Индекс стресса ====== */}
        <Card className={cn("p-4 gap-4 border-2", stressCardBorder)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("profile.stressIndex")}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalcStress}
              disabled={recalcStressMutation.isPending}
              className="min-h-[40px]"
            >
              {t("profile.recalcStress")}
            </Button>
          </div>

          {/* Display */}
          <div
            className={cn(
              "rounded-lg p-4 flex flex-col items-center gap-1",
              stressZoneBg,
            )}
          >
            <div className="flex items-baseline gap-2">
              <span
                className={cn(
                  "text-2xl font-bold tabular-nums",
                  stressZoneColor,
                )}
              >
                {stress.label}
              </span>
              {stressIdx !== null && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {(stressIdx * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-1">
              {stressZoneDesc}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              {t("profile.lastUpdate")}:{" "}
              {profile?.lastStressUpdated
                ? formatDateTime(profile.lastStressUpdated, locale)
                : t("profile.never")}
            </p>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-1">
            {/* Sleep */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Moon className="h-3.5 w-3.5" />
                  {t("profile.sleepHours")}
                </Label>
                <span className="text-sm font-medium tabular-nums">
                  {stressForm.sleepHours.toFixed(1)}
                </span>
              </div>
              <Slider
                value={[stressForm.sleepHours]}
                min={0}
                max={12}
                step={0.5}
                onValueChange={(v) =>
                  setStressForm((prev) => ({
                    ...prev,
                    sleepHours: v[0],
                  }))
                }
                className="min-h-[44px]"
              />
            </div>

            {/* Mood */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Smile className="h-3.5 w-3.5" />
                  {t("profile.mood")}
                </Label>
                <span className="text-sm font-medium tabular-nums">
                  {stressForm.mood}
                </span>
              </div>
              <Slider
                value={[stressForm.mood]}
                min={1}
                max={10}
                step={1}
                onValueChange={(v) =>
                  setStressForm((prev) => ({
                    ...prev,
                    mood: v[0],
                  }))
                }
                className="min-h-[44px]"
              />
            </div>

            {/* Soreness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Heart className="h-3.5 w-3.5" />
                  {t("profile.soreness")}
                </Label>
                <span className="text-sm font-medium tabular-nums">
                  {stressForm.soreness}
                </span>
              </div>
              <Slider
                value={[stressForm.soreness]}
                min={1}
                max={10}
                step={1}
                onValueChange={(v) =>
                  setStressForm((prev) => ({
                    ...prev,
                    soreness: v[0],
                  }))
                }
                className="min-h-[44px]"
              />
            </div>

            {/* Preview line */}
            {previewStressIdx !== null && previewStressIdx !== stressIdx && (
              <p className="text-[11px] text-muted-foreground text-center">
                {t("profile.recalcStress")}: {previewStress.label} (
                {(previewStressIdx * 100).toFixed(0)}%)
              </p>
            )}
          </div>
        </Card>

        {/* ====== D2. Менструальный цикл (Phase 3, female only) ====== */}
        {profile?.gender === "female" && (
          <Card className="p-3 gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    {t("menstrual.title")}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {t("menstrual.subtitle")}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMenstrualDialogOpen(true)}
                disabled={saveMenstrualDateMutation.isPending}
                className="min-h-[40px]"
              >
                {profile.lastMenstrualDate
                  ? t("menstrual.update")
                  : t("menstrual.set")}
              </Button>
            </div>

            {(() => {
              const cycle = calcMenstrualCycle(
                profile.lastMenstrualDate ?? null,
              );
              if (!cycle) {
                // Either no date, or stale (>35 days)
                if (!profile.lastMenstrualDate) {
                  return (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("menstrual.intro")}
                    </p>
                  );
                }
                return (
                  <p className="text-xs text-amber-500 leading-relaxed">
                    {t("menstrual.stale")}
                  </p>
                );
              }
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs uppercase font-bold px-3 py-1",
                        MENSTRUAL_PHASE_BADGE[cycle.phase],
                      )}
                    >
                      {t(`menstrual.phase.${cycle.phase}` as DictKey)}
                    </Badge>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {locale === "ru"
                        ? cycle.descriptionRu
                        : cycle.descriptionEn}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-border/60 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                        {t("menstrual.cycleDay")}
                      </div>
                      <div className="text-xl font-bold tabular-nums mt-0.5">
                        {cycle.cycleDay}
                        <span className="text-base text-muted-foreground">
                          {" "}
                          / 28
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border/60 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                        {t("menstrual.daysUntilNext")}
                      </div>
                      <div className="text-xl font-bold tabular-nums mt-0.5">
                        {cycle.daysUntilNext}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                      {t("menstrual.intensity")}
                    </div>
                    <div className="text-xl font-bold tabular-nums mt-0.5 text-primary">
                      {Math.round(cycle.trainingAdjustment * 100)}%
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
                      {t("menstrual.recommendation")}
                    </div>
                    <p className="text-xs leading-relaxed">
                      {locale === "ru"
                        ? cycle.recommendationRu
                        : cycle.recommendationEn}
                    </p>
                  </div>

                  <div className="rounded-md bg-muted/40 p-2.5 border border-border/40">
                    <p className="text-[10px] text-muted-foreground leading-snug">
                      {t("menstrual.disclaimer")}
                    </p>
                  </div>
                </div>
              );
            })()}
          </Card>
        )}

        {/* ====== E. Травмы и ограничения ====== */}
        <Card className="p-3 gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("profile.injuries")}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInjuryDialogOpen(true)}
              className="min-h-[40px]"
            >
              <Plus className="h-4 w-4" />
              <span>{t("profile.injuries.add")}</span>
            </Button>
          </div>

          {injuriesQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          ) : injuries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t("profile.injuries.empty")}
            </p>
          ) : (
            <div className="space-y-2">
              {injuries.map((inj) => (
                <div
                  key={inj.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[10px]">
                        {t(`profile.bodyPart.${inj.bodyPart}` as DictKey)}
                      </Badge>
                      <Badge
                        variant={
                          inj.severity >= 4
                            ? "destructive"
                            : inj.severity >= 3
                              ? "default"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {inj.severity}/5
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1 truncate">
                      {inj.type}
                    </p>
                    {inj.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {inj.notes}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteInjury(inj.id)}
                    disabled={deleteInjuryMutation.isPending}
                    aria-label={t("profile.delete")}
                    className="shrink-0 text-muted-foreground hover:text-destructive min-h-[44px] min-w-[44px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* ====== Biomech dashboard link ====== */}
        <Link href="/biomech" className="block">
          <Button
            variant="outline"
            className="w-full min-h-[48px] justify-center"
          >
            <Activity className="h-4 w-4" />
            <span>{t("profile.biomechLink")}</span>
          </Button>
        </Link>

        {/* ====== Settings link ====== */}
        <Link href="/settings" className="block">
          <Button
            variant="outline"
            className="w-full min-h-[48px] justify-center"
          >
            <Settings className="h-4 w-4" />
            <span>{t("settings.title")}</span>
          </Button>
        </Link>
      </div>

      {/* ====== Add injury dialog ====== */}
      <Dialog open={injuryDialogOpen} onOpenChange={setInjuryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("profile.injuries.add")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("profile.injuries.add")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Body part */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                {t("profile.bodyPart")}
              </Label>
              <Select
                value={injuryForm.bodyPart}
                onValueChange={(v) =>
                  setInjuryForm((prev) => ({
                    ...prev,
                    bodyPart: v as BodyPart,
                  }))
                }
              >
                <SelectTrigger className="w-full h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BODY_PARTS.map((bp) => (
                    <SelectItem key={bp} value={bp}>
                      {t(`profile.bodyPart.${bp}` as DictKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type */}
            <div className="space-y-1.5">
              <Label htmlFor="injury-type" className="text-xs text-muted-foreground">
                {t("profile.injuryType")}
              </Label>
              <Input
                id="injury-type"
                value={injuryForm.type}
                onChange={(e) =>
                  setInjuryForm((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                placeholder={t("profile.injuryType")}
                className="h-11"
              />
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">
                  {t("profile.severity")}
                </Label>
                <span className="text-sm font-medium tabular-nums">
                  {injuryForm.severity}
                </span>
              </div>
              <Slider
                value={[injuryForm.severity]}
                min={1}
                max={5}
                step={1}
                onValueChange={(v) =>
                  setInjuryForm((prev) => ({
                    ...prev,
                    severity: v[0],
                  }))
                }
                className="min-h-[44px]"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="injury-notes" className="text-xs text-muted-foreground">
                {t("profile.notes")}
              </Label>
              <Textarea
                id="injury-notes"
                value={injuryForm.notes}
                onChange={(e) =>
                  setInjuryForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder={t("profile.notes")}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button
                variant="outline"
                className="flex-1 min-h-[44px]"
              >
                {t("profile.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="default"
              className="flex-1 min-h-[44px]"
              onClick={handleAddInjury}
              disabled={
                createInjuryMutation.isPending || !injuryForm.type.trim()
              }
            >
              {t("profile.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====== Menstrual date dialog (Phase 3, female only) ====== */}
      <Dialog open={menstrualDialogOpen} onOpenChange={setMenstrualDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("menstrual.title")}</DialogTitle>
            <DialogDescription className="sr-only">
              {t("menstrual.intro")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="menstrual-date" className="text-xs text-muted-foreground">
                {t("menstrual.lastDate")}
              </Label>
              <Input
                id="menstrual-date"
                type="date"
                value={menstrualDate}
                onChange={(e) => setMenstrualDate(e.target.value)}
                className="h-11"
                max={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {t("menstrual.disclaimer")}
            </p>
          </div>

          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline" className="flex-1 min-h-[44px]">
                {t("profile.cancel")}
              </Button>
            </DialogClose>
            <Button
              variant="default"
              className="flex-1 min-h-[44px]"
              onClick={handleSaveMenstrualDate}
              disabled={saveMenstrualDateMutation.isPending || !menstrualDate}
            >
              {t("profile.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileShell>
  );
}
