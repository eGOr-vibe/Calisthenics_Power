"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  getProfile,
  saveProfile,
  exportAllData,
  importAllData,
} from "@/lib/local-storage";
import {
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  Check,
  Volume2,
  Mic,
  Cpu,
  Globe,
  Download,
  Upload,
  AlertTriangle,
  Loader2,
  Info,
  Heart,
  ExternalLink,
  Sparkles,
  Smartphone,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AIProviderId, AthleteProfile, Locale } from "@/lib/types";
import { cn } from "@/lib/utils";

// ====== Constants ======

const APP_VERSION = "0.2.0";
const REPO_URL = "https://github.com/calisthenics-power/calisthenics-power";

const AI_PROVIDERS: { id: AIProviderId; labelKey: DictKey }[] = [
  { id: "zai", labelKey: "settings.ai.provider.zai" },
  { id: "webllm", labelKey: "settings.ai.provider.webllm" },
  { id: "custom", labelKey: "settings.ai.provider.custom" },
];

type ThemeOption = "light" | "dark" | "system";

// ====== Helpers ======

function todayStamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a moment before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ====== Main page ======

export default function SettingsPage() {
  const { t, locale, setLocale } = useI18n();
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { toast } = useToast();

  // --- Profile data (localStorage) ---
  const [profile, setProfile] = React.useState<AthleteProfile | null>(() => getProfile());

  // --- Local form state for AI custom fields (kept in sync with profile) ---
  const [aiCustomUrl, setAiCustomUrl] = React.useState("");
  const [aiModel, setAiModel] = React.useState("");
  const [aiProvider, setAiProvider] = React.useState<AIProviderId>("zai");
  const [testState, setTestState] = React.useState<{
    status: "idle" | "loading" | "ok" | "error";
    message?: string;
  }>({ status: "idle" });

  // Sync theme from profile → next-themes (one-time, when profile loads)
  // ВАЖНО: только если next-themes ещё не имеет значения (первый заход на сайт).
  // Если у пользователя уже стоит dark/light в localStorage (next-themes), не перезаписываем.
  const themeSyncedRef = React.useRef(false);
  React.useEffect(() => {
    if (!profile || themeSyncedRef.current) return;
    themeSyncedRef.current = true;
    const dbTheme = profile.theme;
    // next-themes читает из localStorage. Если тема в БД совпадает с next-themes — пропускаем.
    // Если в БД "system" — оставляем как есть (next-themes сам разберётся с системной темой).
    // Если в БД конкретная тема (light/dark) и она отличается от next-themes — применяем из БД.
    if (dbTheme && dbTheme !== "system" && dbTheme !== nextTheme) {
      setNextTheme(dbTheme);
    }
    // Если dbTheme === "system" — ничего не делаем, next-themes уже работает корректно
  }, [profile, nextTheme, setNextTheme]);

  // Sync AI custom fields from profile
  React.useEffect(() => {
    if (profile) {
      setAiProvider(profile.aiProvider);
      setAiCustomUrl(profile.aiCustomUrl ?? "");
      setAiModel(profile.aiModel ?? "");
    }
  }, [profile]);

  // --- Generic patch helper ---
  const patchProfile = (payload: Record<string, unknown>) => {
    try {
      const updated = saveProfile(payload);
      setProfile(updated);
    } catch {
      toast({
        title: t("common.error"),
        description: t("common.retry"),
        variant: "destructive",
      });
    }
  };

  const handleThemeChange = (value: ThemeOption) => {
    setNextTheme(value);
    patchProfile({ theme: value });
  };

  const handleLanguageChange = (value: Locale) => {
    setLocale(value);
    patchProfile({ language: value });
  };

  const handleAudioToggle = (
    key: "ttsEnabled" | "voiceControl" | "showPresets",
    value: boolean,
  ) => {
    patchProfile({ [key]: value });
  };

  const handleProviderChange = (value: AIProviderId) => {
    setAiProvider(value);
    setTestState({ status: "idle" });
    patchProfile({ aiProvider: value });
  };

  const handleCustomUrlBlur = () => {
    if (profile && aiCustomUrl !== (profile.aiCustomUrl ?? "")) {
      patchProfile({ aiCustomUrl: aiCustomUrl.trim() || null });
    }
  };

  const handleModelBlur = () => {
    if (profile && aiModel !== (profile.aiModel ?? "")) {
      patchProfile({ aiModel: aiModel.trim() || null });
    }
  };

  // --- Test AI custom endpoint (external fetch, not /api) ---
  const handleTest = async () => {
    const url = aiCustomUrl.trim();
    const model = aiModel.trim();
    if (!url) {
      setTestState({ status: "error", message: "no_url" });
      toast({
        title: t("settings.testError"),
        description: "no_url",
        variant: "destructive",
      });
      return;
    }
    setTestState({ status: "loading" });
    try {
      const endpoint = url.endsWith("/")
        ? `${url}chat/completions`
        : `${url}/chat/completions`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "llama3.2",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
          stream: false,
        }),
      });
      if (!res.ok) throw new Error(`http_${res.status}`);
      setTestState({ status: "ok" });
      toast({ title: t("settings.testSuccess") });
    } catch (err) {
      const msg = (err as Error).message || "unknown";
      setTestState({ status: "error", message: msg });
      toast({
        title: t("settings.testError"),
        description: msg,
        variant: "destructive",
      });
    }
  };

  // --- Export / Import (localStorage) ---
  const [exportPending, setExportPending] = React.useState(false);
  const [importPending, setImportPending] = React.useState(false);

  const handleExport = () => {
    setExportPending(true);
    try {
      const json = exportAllData();
      const data = JSON.parse(json);
      downloadJson(
        `calisthenics-power-backup-${todayStamp()}.json`,
        data,
      );
      toast({ title: t("settings.exportSuccess") });
    } catch {
      toast({
        title: t("settings.exportError"),
        variant: "destructive",
      });
    } finally {
      setExportPending(false);
    }
  };

  const handleImport = (raw: unknown) => {
    setImportPending(true);
    try {
      // importAllData expects a JSON string
      const jsonStr = typeof raw === "string" ? raw : JSON.stringify(raw);
      importAllData(jsonStr);
      // Refresh profile from localStorage after import
      setProfile(getProfile());
      toast({ title: t("settings.importSuccess") });
    } catch {
      toast({
        title: t("settings.importError"),
        variant: "destructive",
      });
    } finally {
      setImportPending(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      handleImport(text);
    } catch {
      toast({
        title: t("settings.importError"),
        variant: "destructive",
      });
    } finally {
      // Reset input so the same file can be re-selected
      e.target.value = "";
    }
  };

  // --- Derived ---
  const currentTheme =
    (nextTheme as ThemeOption | undefined) ?? profile?.theme ?? "system";

  return (
    <MobileShell showBottomNav={false}>
      <PageHeader
        title={t("settings.title")}
        right={
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="min-h-[44px] min-w-[44px]"
            aria-label={t("common.back")}
          >
            <Link href="/profile">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* ====== 1. Appearance ====== */}
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.appearance")}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("settings.theme")}
            </Label>
            <div
              role="radiogroup"
              aria-label={t("settings.theme")}
              className="grid grid-cols-3 gap-2"
            >
              {(
                [
                  { id: "light", icon: Sun, labelKey: "settings.theme.light" },
                  { id: "dark", icon: Moon, labelKey: "settings.theme.dark" },
                  { id: "system", icon: Monitor, labelKey: "settings.theme.system" },
                ] as { id: ThemeOption; icon: typeof Sun; labelKey: DictKey }[]
              ).map(({ id, icon: Icon, labelKey }) => {
                const active = currentTheme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => handleThemeChange(id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-3 min-h-[56px] transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium leading-none">
                      {t(labelKey)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* AMOLED toggle */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{t("settings.amoled")}</div>
                  <p className="text-xs text-muted-foreground">{t("settings.amoledDesc")}</p>
                </div>
              </div>
              <Switch
                checked={typeof document !== "undefined" && document.documentElement.classList.contains("amoled")}
                onCheckedChange={(checked) => {
                  if (typeof document === "undefined") return;
                  if (checked) {
                    document.documentElement.classList.add("amoled");
                  } else {
                    document.documentElement.classList.remove("amoled");
                  }
                }}
              />
            </div>
          </div>
        </Card>

        {/* ====== 2. Language ====== */}
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.language")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "ru" as Locale, labelKey: "settings.language.ru" },
                { id: "en" as Locale, labelKey: "settings.language.en" },
              ] as { id: Locale; labelKey: DictKey }[]
            ).map(({ id, labelKey }) => {
              const active = locale === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleLanguageChange(id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-3 min-h-[44px] transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background hover:bg-accent",
                  )}
                >
                  <span className="text-sm font-medium">{t(labelKey)}</span>
                  {active && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </Card>

        {/* ====== 3. Audio ====== */}
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.audio")}
            </span>
          </div>

          <AudioRow
            icon={<Volume2 className="h-5 w-5 text-muted-foreground" />}
            title={t("settings.tts")}
            description={t("settings.tts.desc")}
            checked={profile?.ttsEnabled ?? true}
            disabled={false}
            onCheckedChange={(v) => handleAudioToggle("ttsEnabled", v)}
          />

          <AudioRow
            icon={<Mic className="h-5 w-5 text-muted-foreground" />}
            title={t("settings.voiceControl")}
            description={t("settings.voiceControl.desc")}
            checked={profile?.voiceControl ?? false}
            disabled={false}
            onCheckedChange={(v) => handleAudioToggle("voiceControl", v)}
          />

          <AudioRow
            icon={<Sparkles className="h-5 w-5 text-muted-foreground" />}
            title={t("settings.presets")}
            description={t("settings.presets.desc")}
            checked={profile?.showPresets ?? true}
            disabled={false}
            onCheckedChange={(v) => handleAudioToggle("showPresets", v)}
          />
        </Card>

        {/* ====== 4. AI provider ====== */}
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.ai")}
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("settings.ai.provider")}
            </Label>
            <Select
              value={aiProvider}
              onValueChange={(v) => handleProviderChange(v as AIProviderId)}
            >
              <SelectTrigger className="w-full h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {t(p.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground leading-snug">
              {aiProvider === "zai"
                ? t("settings.ai.provider.zai")
                : aiProvider === "webllm"
                  ? t("settings.ai.provider.webllm")
                  : t("settings.ai.provider.custom")}
            </p>
          </div>

          {aiProvider === "custom" && (
            <>
              <div className="space-y-1.5">
                <Label
                  htmlFor="settings-ai-url"
                  className="text-xs text-muted-foreground"
                >
                  {t("settings.ai.customUrl")}
                </Label>
                <Input
                  id="settings-ai-url"
                  value={aiCustomUrl}
                  onChange={(e) => setAiCustomUrl(e.target.value)}
                  onBlur={handleCustomUrlBlur}
                  placeholder={t("settings.ai.customUrl.ph")}
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="settings-ai-model"
                  className="text-xs text-muted-foreground"
                >
                  {t("settings.ai.model")}
                </Label>
                <Input
                  id="settings-ai-model"
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  onBlur={handleModelBlur}
                  placeholder={t("settings.ai.model.ph")}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="h-11"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTest}
                  disabled={testState.status === "loading"}
                  className="min-h-[44px] flex-1"
                >
                  {testState.status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("settings.ai.testing")}</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4" />
                      <span>{t("settings.ai.test")}</span>
                    </>
                  )}
                </Button>

                {testState.status === "ok" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                    <Check className="h-4 w-4" />
                    {t("settings.testSuccess")}
                  </span>
                )}
                {testState.status === "error" && (
                  <span className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    {t("settings.testError")}
                  </span>
                )}
              </div>
            </>
          )}
        </Card>

        {/* ====== 5. Data ====== */}
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.data")}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            disabled={exportPending}
            className="w-full min-h-[44px] justify-start"
          >
            {exportPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="flex-1 text-left">{t("settings.export")}</span>
          </Button>

          <p className="text-xs text-muted-foreground leading-snug">
            {t("settings.export.desc")}
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={handleImportClick}
            disabled={importPending}
            className="w-full min-h-[44px] justify-start"
          >
            {importPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span className="flex-1 text-left">{t("settings.import")}</span>
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-xs text-destructive/80 leading-snug">
            {t("settings.import.warning")}
          </p>
        </Card>

        {/* ====== 6. About ====== */}
        <Card className="p-3 gap-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {t("settings.about")}
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-base font-bold text-foreground">
              {t("app.name")}
            </div>
            <div className="text-xs text-muted-foreground">
              {t("settings.version")} {APP_VERSION}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {t("settings.about.tagline")}
          </p>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-primary hover:underline min-h-[44px] py-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>{t("settings.about.repo")}</span>
          </a>

          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              {t("settings.about.madeWithLove")}
            </span>
          </div>
        </Card>
      </div>
    </MobileShell>
  );
}

// ====== Sub-components ======

interface AudioRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}

function AudioRow({
  icon,
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: AudioRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 min-h-[44px] py-1.5">
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium leading-tight">{title}</div>
          <div className="text-xs text-muted-foreground leading-snug mt-0.5">
            {description}
          </div>
        </div>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        className="scale-125 origin-right shrink-0"
      />
    </div>
  );
}
