"use client";

import * as React from "react";
import {
  getSpots,
  addSpot,
  deleteSpot,
} from "@/lib/local-storage";
import {
  Plus,
  Trash2,
  MapPin,
  Star,
  Dumbbell,
  Search,
  Navigation,
  Copy,
  ExternalLink,
} from "lucide-react";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface WorkoutSpot {
  id: string;
  name: string;
  description: string | null;
  lat: number;
  lng: number;
  address: string | null;
  hasBar: boolean;
  hasDips: boolean;
  hasParallettes: boolean;
  hasRings: boolean;
  hasWall: boolean;
  rating: number;
  createdAt: string;
}

const EQUIPMENT_KEYS = [
  { key: "hasBar", label: "Перекладина" },
  { key: "hasDips", label: "Брусья" },
  { key: "hasParallettes", label: "Паралетсы" },
  { key: "hasRings", label: "Кольца" },
  { key: "hasWall", label: "Стена" },
] as const;

function ratingStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

export default function SpotsPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    address: "",
    lat: "",
    lng: "",
    hasBar: true,
    hasDips: true,
    hasParallettes: false,
    hasRings: false,
    hasWall: false,
    rating: 3,
  });

  // --- Data: spots (localStorage) ---
  const [spots, setSpots] = React.useState<WorkoutSpot[]>(() => getSpots());
  const filtered = searchQuery.trim()
    ? spots.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : spots;

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast({ title: t("spots.nameRequired"), variant: "destructive" });
      return;
    }
    try {
      addSpot({
        name: form.name.trim(),
        description: form.description.trim() || null,
        address: form.address.trim() || null,
        lat: Number(form.lat) || 0,
        lng: Number(form.lng) || 0,
        hasBar: form.hasBar,
        hasDips: form.hasDips,
        hasParallettes: form.hasParallettes,
        hasRings: form.hasRings,
        hasWall: form.hasWall,
        rating: form.rating,
      });
      setSpots(getSpots());
      toast({ description: t("spots.saved") });
      setSheetOpen(false);
      setForm({
        name: "", description: "", address: "", lat: "", lng: "",
        hasBar: true, hasDips: true, hasParallettes: false, hasRings: false, hasWall: false, rating: 3,
      });
    } catch {
      toast({ title: t("common.error"), variant: "destructive" });
    }
  };

  return (
    <MobileShell>
      {/* Compact header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border safe-top">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-sm">{t("spots.title")}</h1>
          </div>
          <Badge variant="secondary" className="text-[10px]">{spots.length}</Badge>
        </div>
        <div className="px-4 pb-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("spots.search")}
              className="pl-9 h-9 min-h-[36px] rounded-lg bg-card text-sm"
            />
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-3 space-y-2">
        {/* Intro */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          {t("spots.intro")}
        </p>

        {/* Add button */}
        <Button className="w-full h-9" onClick={() => setSheetOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("spots.add")}
        </Button>

        {/* List */}
        {filtered.length === 0 ? (
          <Card className="p-4 text-center border-dashed">
            <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">
              {searchQuery ? t("spots.emptySearch") : t("spots.empty")}
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((spot) => (
              <Card key={spot.id} className="p-3 flex flex-col gap-2">
                {/* Name + rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm leading-tight truncate">
                      {spot.name}
                    </h3>
                    {spot.address && (
                      <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                        <MapPin className="h-2.5 w-2.5 inline mr-0.5" />
                        {spot.address}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-amber-500">{ratingStars(spot.rating)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        deleteSpot(spot.id);
                        setSpots(getSpots());
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                {/* Description */}
                {spot.description && (
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {spot.description}
                  </p>
                )}
                {/* Equipment badges */}
                <div className="flex flex-wrap gap-1">
                  {EQUIPMENT_KEYS.map(({ key, label }) => {
                    const has = spot[key as keyof WorkoutSpot] as boolean;
                    if (!has) return null;
                    return (
                      <Badge
                        key={key}
                        variant="outline"
                        className="text-[9px] h-4 px-1 bg-primary/5 border-primary/30 text-primary"
                      >
                        {label}
                      </Badge>
                    );
                  })}
                </div>
                {/* Action buttons: Open in maps, copy coords */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <a
                    href={`https://maps.google.com/?q=${spot.lat},${spot.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 h-7 px-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors touch-manipulation"
                  >
                    <Navigation className="h-3 w-3" />
                    {t("spots.openMaps")}
                  </a>
                  <button
                    onClick={() => {
                      const coords = `${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)}`;
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(coords);
                        toast({ description: t("spots.coordsCopied") });
                      }
                    }}
                    className="flex items-center gap-1 h-7 px-2 rounded-lg border border-border text-muted-foreground text-[10px] font-medium hover:bg-accent transition-colors touch-manipulation"
                  >
                    <Copy className="h-3 w-3" />
                    {t("spots.copyCoords")}
                  </button>
                  {spot.address && (
                    <button
                      onClick={() => {
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(spot.address!);
                          toast({ description: t("spots.addressCopied") });
                        }
                      }}
                      className="flex items-center gap-1 h-7 px-2 rounded-lg border border-border text-muted-foreground text-[10px] font-medium hover:bg-accent transition-colors touch-manipulation ml-auto"
                    >
                      <Copy className="h-3 w-3" />
                      {t("spots.copyAddress")}
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="p-0 max-h-[85vh] overflow-y-auto">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-base">{t("spots.add")}</SheetTitle>
          </SheetHeader>
          <div className="px-4 py-3 space-y-3">
            {/* Name */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("spots.name")} *
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={t("spots.namePlaceholder")}
                className="h-9"
              />
            </div>
            {/* Address */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("spots.address")}
              </Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder={t("spots.addressPlaceholder")}
                className="h-9"
              />
            </div>
            {/* Coordinates */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[9px] text-muted-foreground">Координаты (lat, lng)</Label>
                <button
                  onClick={() => {
                    if (!navigator.geolocation) {
                      toast({ title: t("spots.geolocationError"), variant: "destructive" });
                      return;
                    }
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setForm({
                          ...form,
                          lat: pos.coords.latitude.toFixed(6),
                          lng: pos.coords.longitude.toFixed(6),
                        });
                        toast({ description: t("spots.coordsCopied") });
                      },
                      () => {
                        toast({ title: t("spots.geolocationError"), variant: "destructive" });
                      },
                    );
                  }}
                  className="flex items-center gap-1 h-6 px-2 rounded text-[9px] font-medium text-primary hover:bg-accent transition-colors touch-manipulation"
                >
                  <Navigation className="h-2.5 w-2.5" />
                  {t("spots.useGeolocation")}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  step="0.0001"
                  value={form.lat}
                  onChange={(e) => setForm({ ...form, lat: e.target.value })}
                  placeholder="59.4370"
                  className="h-9"
                />
                <Input
                  type="number"
                  step="0.0001"
                  value={form.lng}
                  onChange={(e) => setForm({ ...form, lng: e.target.value })}
                  placeholder="30.3141"
                  className="h-9"
                />
              </div>
            </div>
            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("spots.description")}
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={t("spots.descriptionPlaceholder")}
                rows={2}
                className="resize-none"
              />
            </div>
            {/* Equipment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("spots.equipment")}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT_KEYS.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-border">
                    <span className="text-xs">{label}</span>
                    <Switch
                      checked={form[key as keyof typeof form] as boolean}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Rating */}
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("spots.rating")}: <span className="text-amber-500">{ratingStars(form.rating)}</span>
              </Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setForm({ ...form, rating: n })}
                    className={cn(
                      "flex-1 h-8 rounded text-sm transition-colors touch-manipulation",
                      form.rating >= n ? "text-amber-500" : "text-muted-foreground",
                    )}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
          <SheetFooter className="p-4 pt-2">
            <Button className="w-full h-9" onClick={handleSubmit} disabled={false}>
              {t("common.save")}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </MobileShell>
  );
}
