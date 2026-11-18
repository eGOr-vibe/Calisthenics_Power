"use client";

import { useI18n } from "@/components/i18n-provider";
import { MobileShell } from "@/components/layout/mobile-shell";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const { t } = useI18n();

  return (
    <MobileShell showBottomNav={false}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-4">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">
            {t("offline.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("offline.message")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4" />
          {t("offline.retry")}
        </Button>
      </div>
    </MobileShell>
  );
}
