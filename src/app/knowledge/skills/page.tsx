"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Lock,
  Check,
  Star,
  Diamond,
  Target,
  ChevronRight,
  Trophy,
  Zap,
  AlertCircle,
  Plus,
  Minus,
  Maximize,
  Heart,
  Dumbbell,
  Footprints,
  Sparkles,
  Wind,
  Eye,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import type { DictKey } from "@/lib/i18n";
import { MobileShell } from "@/components/layout/mobile-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

import type { SkillNode, SkillBranch, UserSkillState } from "@/lib/types";

// ============================================================
// SkillsTreePage v3 — inspired by ArcRaiders / Diablo 2
// Маленькие круглые узлы с иконками, цветные линии связи,
// tooltip при наведении/тапе, zoom/pan работает.
// ============================================================

// Branches with their colors and icons
const BRANCHES: Array<{
  id: SkillBranch | "all";
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeColor: string;
}> = [
  { id: "all", icon: Target, color: "text-foreground", activeColor: "bg-primary" },
  { id: "pull", icon: ArrowLeft, color: "text-red-400", activeColor: "bg-red-500" },
  { id: "push", icon: ChevronRight, color: "text-orange-400", activeColor: "bg-orange-500" },
  { id: "core", icon: Diamond, color: "text-amber-400", activeColor: "bg-amber-500" },
  { id: "legs", icon: Footprints, color: "text-emerald-400", activeColor: "bg-emerald-500" },
  { id: "static", icon: Star, color: "text-purple-400", activeColor: "bg-purple-500" },
  { id: "explosive", icon: Zap, color: "text-yellow-400", activeColor: "bg-yellow-500" },
  { id: "mobility", icon: Wind, color: "text-teal-400", activeColor: "bg-teal-500" },
];

// Branch colors for lines (RGB strings for SVG)
const BRANCH_LINE_COLORS: Record<SkillBranch, string> = {
  pull: "rgb(239 68 68)",      // red-500
  push: "rgb(249 115 22)",     // orange-500
  core: "rgb(245 158 11)",     // amber-500
  legs: "rgb(16 185 129)",     // emerald-500
  static: "rgb(168 85 247)",   // purple-500
  explosive: "rgb(234 179 8)", // yellow-500
  mobility: "rgb(20 184 166)", // teal-500
};

// Branch icon mapping (lucide icons shown inside nodes)
function getBranchIcon(branch: SkillBranch) {
  switch (branch) {
    case "pull": return ArrowLeft;
    case "push": return ChevronRight;
    case "core": return Diamond;
    case "legs": return Footprints;
    case "static": return Star;
    case "explosive": return Zap;
    case "mobility": return Wind;
    default: return Target;
  }
}

type NodeState = "unlocked" | "current" | "locked";

function getNodeState(
  node: SkillNode,
  unlockedSlugs: Set<string>
): NodeState {
  if (unlockedSlugs.has(node.slug)) return "unlocked";
  if (node.prerequisites.length === 0) return "current";
  const allPrereqsMet = node.prerequisites.every((p) => unlockedSlugs.has(p));
  return allPrereqsMet ? "current" : "locked";
}

// ============================================================
// Single Node — small circle with icon, tooltip on hover/tap
// ============================================================

interface NodeProps {
  node: SkillNode;
  state: NodeState;
  bestResult?: string | null;
  onClick: () => void;
  onHoverEnter?: (slug: string | null) => void;
  isHovered: boolean;
}

function SkillNodeCircle({
  node,
  state,
  onClick,
  onHoverEnter,
  isHovered,
}: NodeProps) {
  const lineColor = BRANCH_LINE_COLORS[node.branch];

  // State-based styling
  let bgColor = "rgb(30 41 59)"; // slate-800
  let strokeColor = "rgb(51 65 85)"; // slate-700
  let iconColor = "rgb(148 163 184)"; // slate-400
  let glow = "";

  if (state === "unlocked") {
    bgColor = lineColor;
    strokeColor = lineColor;
    iconColor = "rgb(255 255 255)";
    glow = `drop-shadow(0 0 6px ${lineColor})`;
  } else if (state === "current") {
    bgColor = lineColor;
    strokeColor = "rgb(255 255 255)";
    iconColor = "rgb(255 255 255)";
    glow = `drop-shadow(0 0 8px ${lineColor})`;
    // Pulsing animation for current
  } else {
    // locked — dim
    bgColor = "rgb(15 23 42)"; // slate-900
    strokeColor = "rgb(51 65 85)";
    iconColor = "rgb(71 85 105)"; // slate-600
  }

  const r = isHovered ? 7 : 6;

  return (
    <g
      onClick={onClick}
      onMouseEnter={() => onHoverEnter?.(node.slug)}
      onMouseLeave={() => onHoverEnter?.(null)}
      style={{ cursor: "pointer" }}
    >
      {/* Hover ring */}
      {isHovered && (
        <circle
          cx={node.x}
          cy={node.y}
          r={r + 2}
          fill="none"
          stroke={lineColor}
          strokeWidth="0.5"
          opacity="0.6"
        />
      )}
      {/* Main circle */}
      <circle
        cx={node.x}
        cy={node.y}
        r={r}
        fill={bgColor}
        stroke={strokeColor}
        strokeWidth={state === "current" ? "1" : "0.5"}
        style={{ filter: glow ? `drop-shadow(0 0 4px ${lineColor})` : undefined }}
      />
      {/* Icon inside (scaled to fit) */}
      <g transform={`translate(${node.x - 3}, ${node.y - 3}) scale(0.25)`}>
        {node.branch === "pull" && <ArrowLeft />}
        {node.branch === "push" && <ChevronRight />}
        {node.branch === "core" && <Diamond />}
        {node.branch === "legs" && <Footprints />}
        {node.branch === "static" && <Star />}
        {node.branch === "explosive" && <Zap />}
        {node.branch === "mobility" && <Wind />}
      </g>
      {/* Lock icon overlay if locked */}
      {state === "locked" && (
        <g transform={`translate(${node.x + 3}, ${node.y - 3}) scale(0.18)`}>
          <Lock />
        </g>
      )}
      {/* Order number below the node (small) */}
      <text
        x={node.x}
        y={node.y + r + 2.5}
        textAnchor="middle"
        fontSize="2"
        fontWeight="600"
        fill={state === "locked" ? "rgb(71 85 105)" : "rgb(148 163 184)"}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {node.order}
      </text>
    </g>
  );
}

// ============================================================
// Edge (line between nodes)
// ============================================================

function Edge({
  from,
  to,
  branch,
  isUnlocked,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  branch: SkillBranch;
  isUnlocked: boolean;
}) {
  const color = BRANCH_LINE_COLORS[branch];
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={isUnlocked ? color : "rgb(51 65 85)"}
      strokeWidth={isUnlocked ? "0.6" : "0.3"}
      strokeDasharray={isUnlocked ? "none" : "1,1"}
      opacity={isUnlocked ? 0.7 : 0.3}
    />
  );
}

// ============================================================
// Detail Sheet (same as before but simplified)
// ============================================================

function NodeDetailSheet({
  node,
  state,
  bestResult,
  open,
  onOpenChange,
  onRecordAttempt,
}: {
  node: SkillNode | null;
  state: NodeState;
  bestResult: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecordAttempt: (value: number, note: string) => void;
}) {
  const { t, locale } = useI18n();
  const [value, setValue] = React.useState("");
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setValue("");
      setNote("");
    }
  }, [open]);

  if (!node) return null;

  const name = locale === "ru" ? node.nameRu : node.nameEn;
  const description = locale === "ru" ? node.descriptionRu : node.descriptionEn;
  const gateNotes = locale === "ru" ? node.gateNotesRu : node.gateNotesEn;
  const gateText = node.gateSec
    ? `${node.gateSec} ${locale === "ru" ? "сек удержания" : "sec hold"}`
    : node.gateReps
    ? `${node.gateReps} ${locale === "ru" ? "повторений" : "reps"}`
    : null;

  const lineColor = BRANCH_LINE_COLORS[node.branch];
  const stateInfo = {
    unlocked: { label: t("skills.unlocked"), color: "text-emerald-500", icon: Check },
    current: { label: t("skills.current"), color: "text-red-500", icon: Target },
    locked: { label: t("skills.locked"), color: "text-slate-400", icon: Lock },
  }[state];
  const StateIcon = stateInfo.icon;

  const handleSubmit = () => {
    const num = Number(value);
    if (!isNaN(num) && num > 0) {
      onRecordAttempt(num, note);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto p-0"
      >
        <SheetHeader className="p-4 pb-2 space-y-3">
          {/* Color bar matching branch */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ backgroundColor: lineColor }}
          />
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="p-2 rounded-full shrink-0"
                style={{ backgroundColor: lineColor }}
              >
                {React.createElement(getBranchIcon(node.branch), {
                  className: "h-4 w-4 text-white",
                })}
              </div>
              <SheetTitle className="text-lg font-bold truncate">
                {name}
              </SheetTitle>
            </div>
            <div className={cn("flex items-center gap-1 text-xs font-medium shrink-0", stateInfo.color)}>
              <StateIcon className="h-3.5 w-3.5" />
              {stateInfo.label}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border text-xs font-bold">
              K {node.loadCoef}
            </Badge>
            <Badge
              variant="outline"
              className="border text-xs"
              style={{ color: lineColor }}
            >
              {t(`skills.branch.${node.branch}` as DictKey)}
            </Badge>
            {node.exerciseSlug && (
              <Link href={`/exercises/${node.exerciseSlug}`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  {t("skills.viewExercise")}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            )}
          </div>
          <SheetDescription className="text-sm leading-relaxed">
            {description}
          </SheetDescription>
        </SheetHeader>

        {/* Gate */}
        {gateText && (
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("skills.gate")}
              </span>
            </div>
            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3">
              <div className="font-bold text-primary text-lg">{gateText}</div>
              {gateNotes && (
                <p className="text-xs text-muted-foreground mt-1">{gateNotes}</p>
              )}
            </div>
          </div>
        )}

        {/* Best result */}
        {bestResult && (
          <div className="px-4 py-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {t("skills.bestResult")}
            </div>
            <div className="text-sm text-emerald-500 font-medium">
              {bestResult}
            </div>
          </div>
        )}

        {/* Record attempt form */}
        {state !== "unlocked" && (
          <div className="px-4 py-3 space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("skills.record")}
            </Label>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder={t("skills.record")}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-11"
              />
              <Textarea
                placeholder={t("skills.notePlaceholder")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="resize-none"
              />
              <Button
                onClick={handleSubmit}
                disabled={!value || Number(value) <= 0}
                className="w-full h-11"
              >
                {t("common.save")}
              </Button>
            </div>
          </div>
        )}

        <SheetFooter className="p-4 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full h-11"
          >
            {t("common.close")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================
// Hover Tooltip (quick info card)
// ============================================================

function HoverTooltip({
  node,
  state,
  bestResult,
}: {
  node: SkillNode | null;
  state: NodeState;
  bestResult?: string | null;
}) {
  const { t, locale } = useI18n();
  if (!node) return null;

  const name = locale === "ru" ? node.nameRu : node.nameEn;
  const gateText = node.gateSec
    ? `${node.gateSec} ${locale === "ru" ? "сек" : "sec"}`
    : node.gateReps
    ? `${node.gateReps} ${locale === "ru" ? "повт" : "reps"}`
    : null;

  const lineColor = BRANCH_LINE_COLORS[node.branch];

  return (
    <Card
      className="absolute z-50 p-3 gap-1.5 max-w-[260px] pointer-events-none shadow-xl"
      style={{
        bottom: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        borderColor: lineColor,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: lineColor }}
        />
        <span className="font-semibold text-sm leading-tight">{name}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="border text-[10px] font-bold h-5">
          K {node.loadCoef}
        </Badge>
        {gateText && (
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            {gateText}
          </span>
        )}
        <span className={cn(
          "font-medium",
          state === "unlocked" && "text-emerald-500",
          state === "current" && "text-red-500",
          state === "locked" && "text-slate-400",
        )}>
          {state === "unlocked" ? t("skills.unlocked") : state === "current" ? t("skills.current") : t("skills.locked")}
        </span>
      </div>
      {bestResult && (
        <div className="text-xs text-emerald-500 font-medium truncate">
          {bestResult}
        </div>
      )}
      <div className="text-[10px] text-muted-foreground italic">
        {t("skills.tapForDetails")}
      </div>
    </Card>
  );
}

// ============================================================
// Main page
// ============================================================

const SVG_VIEW_WIDTH = 110;
const SVG_VIEW_HEIGHT = 85;

export default function SkillsTreePage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeBranch, setActiveBranch] = React.useState<SkillBranch | "all">("pull");
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

  // Zoom/pan state
  const [scale, setScale] = React.useState(1);
  const [translate, setTranslate] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragRef = React.useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
  });

  // Fetch all skill nodes
  const nodesQuery = useQuery({
    queryKey: ["skills", activeBranch],
    queryFn: async () => {
      const url = activeBranch === "all"
        ? "/api/skills"
        : `/api/skills?branch=${activeBranch}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load skills");
      return res.json() as Promise<SkillNode[]>;
    },
  });

  // Fetch user's skill states
  const statesQuery = useQuery({
    queryKey: ["skill-states"],
    queryFn: async () => {
      const res = await fetch("/api/skills/state");
      if (!res.ok) throw new Error("Failed to load skill states");
      return res.json() as Promise<UserSkillState[]>;
    },
  });

  const nodes = nodesQuery.data ?? [];
  const states = statesQuery.data ?? [];
  const unlockedSlugs = React.useMemo(
    () => new Set(states.filter((s) => s.isUnlocked).map((s) => s.skillSlug)),
    [states]
  );

  const totalUnlocked = unlockedSlugs.size;
  const total = nodes.length;

  // Selected node for sheet
  const selectedNode = nodes.find((n) => n.slug === selectedSlug) ?? null;
  const selectedState = selectedNode
    ? getNodeState(selectedNode, unlockedSlugs)
    : "locked";
  const selectedBestResult = states.find(
    (s) => s.skillSlug === selectedSlug
  )?.bestResult ?? null;

  // Hovered node for tooltip
  const hoveredNode = nodes.find((n) => n.slug === hoveredSlug) ?? null;
  const hoveredState = hoveredNode
    ? getNodeState(hoveredNode, unlockedSlugs)
    : "locked";
  const hoveredBestResult = states.find(
    (s) => s.skillSlug === hoveredSlug
  )?.bestResult ?? null;

  // Build edges (lines between nodes based on prerequisites)
  const edges = React.useMemo(() => {
    const result: Array<{
      from: SkillNode;
      to: SkillNode;
      branch: SkillBranch;
    }> = [];
    for (const node of nodes) {
      for (const prereqSlug of node.prerequisites) {
        const prereq = nodes.find((n) => n.slug === prereqSlug);
        if (prereq) {
          result.push({ from: prereq, to: node, branch: node.branch });
        }
      }
    }
    return result;
  }, [nodes]);

  // Record attempt mutation
  const recordMutation = useMutation({
    mutationFn: async ({ slug, value, note }: { slug: string; value: number; note: string }) => {
      const res = await fetch(`/api/skills/state/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, note: note || null }),
      });
      if (!res.ok) throw new Error("Failed to record attempt");
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["skill-states"] });
      if (data.isUnlocked && !data.wasUnlocked) {
        toast({
          title: t("skills.congrats"),
        });
      } else {
        toast({
          description: t("skills.saved", { result: data.bestResult ?? "" }),
        });
      }
    },
    onError: () => {
      toast({
        title: t("common.error"),
        variant: "destructive",
      });
    },
  });

  // Zoom/pan handlers
  const handleZoomIn = React.useCallback(() => {
    setScale((s) => Math.min(3, s * 1.25));
  }, []);

  const handleZoomOut = React.useCallback(() => {
    setScale((s) => Math.max(0.6, s / 1.25));
  }, []);

  const handleReset = React.useCallback(() => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  }, []);

  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startTx: translate.x,
      startTy: translate.y,
    };
    setIsDragging(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  }, [translate]);

  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }
    setTranslate({
      x: dragRef.current.startTx + dx,
      y: dragRef.current.startTy + dy,
    });
  }, []);

  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    dragRef.current.active = false;
    setIsDragging(false);
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  }, []);

  const handleNodeClick = React.useCallback((slug: string) => {
    if (dragRef.current.moved) return;
    setSelectedSlug(slug);
    setSheetOpen(true);
  }, []);

  const handleRecordAttempt = (value: number, note: string) => {
    if (selectedSlug) {
      recordMutation.mutate({ slug: selectedSlug, value, note });
    }
  };

  // Loading
  if (nodesQuery.isLoading) {
    return (
      <MobileShell>
        <PageHeader title={t("skills.title")} subtitle={t("skills.subtitle")} />
        <div className="flex-1 px-4 py-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <PageHeader title={t("skills.title")} subtitle={t("skills.subtitle")} />

      <div className="flex-1 px-4 py-4 space-y-4">
        {/* Intro */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t("skills.intro")}
        </p>

        {/* Progress */}
        <Card className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("skills.unlocked")}
            </span>
            <span className="text-sm font-bold tabular-nums">
              {totalUnlocked} / {total}
            </span>
          </div>
          <Progress value={total > 0 ? (totalUnlocked / total) * 100 : 0} className="h-1.5" />
        </Card>

        {/* Branch filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {BRANCHES.map((branch) => {
            const Icon = branch.icon;
            const active = activeBranch === branch.id;
            return (
              <button
                key={branch.id}
                onClick={() => setActiveBranch(branch.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 h-9 rounded-full border whitespace-nowrap text-xs font-medium transition-colors touch-manipulation min-h-[36px]",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", !active && branch.color)} />
                {t(`skills.branch.${branch.id}` as DictKey)}
              </button>
            );
          })}
        </div>

        {/* Graph container — like ArcRaiders */}
        {nodesQuery.isError ? (
          <Card className="p-3 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{t("common.error")}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => nodesQuery.refetch()}
            >
              {t("common.retry")}
            </Button>
          </Card>
        ) : nodes.length === 0 ? (
          <Card className="p-3 text-center">
            <p className="text-sm text-muted-foreground">{t("skills.empty")}</p>
          </Card>
        ) : (
          <div className="relative">
            {/* Graph */}
            <Card className="relative p-0 overflow-hidden bg-slate-950/50">
              <div
                className="relative w-full touch-none select-none cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{ minHeight: 420 }}
              >
                <svg
                  viewBox={`0 0 ${SVG_VIEW_WIDTH} ${SVG_VIEW_HEIGHT}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="absolute inset-0 w-full h-full"
                  style={{
                    transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
                    transformOrigin: "center center",
                    transition: isDragging ? "none" : "transform 0.1s ease-out",
                  }}
                >
                  {/* Edges */}
                  {edges.map((edge, i) => {
                    const isUnlocked =
                      unlockedSlugs.has(edge.from.slug) ||
                      unlockedSlugs.has(edge.to.slug);
                    return (
                      <Edge
                        key={i}
                        from={{ x: edge.from.x, y: edge.from.y }}
                        to={{ x: edge.to.x, y: edge.to.y }}
                        branch={edge.branch}
                        isUnlocked={isUnlocked}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {nodes.map((node) => {
                    const state = getNodeState(node, unlockedSlugs);
                    return (
                      <SkillNodeCircle
                        key={node.slug}
                        node={node}
                        state={state}
                        bestResult={states.find((s) => s.skillSlug === node.slug)?.bestResult}
                        onClick={() => handleNodeClick(node.slug)}
                        onHoverEnter={setHoveredSlug}
                        isHovered={hoveredSlug === node.slug}
                      />
                    );
                  })}
                </svg>

                {/* Hover tooltip */}
                {hoveredNode && !sheetOpen && (
                  <HoverTooltip
                    node={hoveredNode}
                    state={hoveredState}
                    bestResult={hoveredBestResult}
                  />
                )}
              </div>

              {/* Zoom controls */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 shadow-md"
                  onClick={handleZoomIn}
                  aria-label={t("skills.zoomIn")}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 shadow-md"
                  onClick={handleZoomOut}
                  aria-label={t("skills.zoomOut")}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 shadow-md"
                  onClick={handleReset}
                  aria-label={t("skills.reset")}
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* Legend */}
            <Card className="p-3 mt-2 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("skills.legend")}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">{t("skills.unlocked")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">{t("skills.current")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <span className="text-muted-foreground">{t("skills.locked")}</span>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground italic">
                {t("skills.hint")}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <NodeDetailSheet
        node={selectedNode}
        state={selectedState}
        bestResult={selectedBestResult}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onRecordAttempt={handleRecordAttempt}
      />
    </MobileShell>
  );
}
