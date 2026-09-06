"use client";

import * as React from "react";
import { RotateCcw, Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  resetDemoSessionAction,
  exitDemoToPortfolioAction,
} from "@/features/dashboard/actions/demo.actions";

export function DemoBanner() {
  const [isResetting, setIsResetting] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);

  // Rilevamento nuova scheda / apertura sessione portfolio:
  // Se la scheda e nuova (sessionStorage non valorizzato), esegue il reset iniziale ai dati del Prof. Mario Rossi
  React.useEffect(() => {
    try {
      const activeTab = sessionStorage.getItem("edubook_demo_active_tab");
      if (!activeTab) {
        sessionStorage.setItem("edubook_demo_active_tab", "true");
        resetDemoSessionAction().catch((err) =>
          console.error("[DemoBanner] Reset iniziale nuova scheda:", err)
        );
      }
    } catch {
      // sessionStorage non accessibile in contesti restrittivi
    }
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const res = await resetDemoSessionAction();
      if (!res.success) {
        toast.error(res.error || "Impossibile ripristinare i dati demo.");
        return;
      }
      toast.success("Sandbox demo ripristinata con successo!");
      window.location.reload();
    } catch {
      toast.error("Si e verificato un errore durante il reset.");
    } finally {
      setIsResetting(false);
    }
  };

  const handleExitToPortfolio = async () => {
    setIsExiting(true);
    try {
      sessionStorage.removeItem("edubook_demo_active_tab");
      const res = await exitDemoToPortfolioAction();
      window.location.href = res.redirectUrl || "https://gabrielefarigu.com";
    } catch {
      window.location.href = "https://gabrielefarigu.com";
    }
  };

  return (
    <div className="w-full bg-primary/10 border-b border-primary/20 text-primary px-4 py-2 text-xs">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 hidden sm:inline" />
          <span>
            <strong>Modalita Demo:</strong> Sandbox isolata del <strong>Prof. Mario Rossi</strong>. I dati sono temporanei per la sessione e non toccano il database principale.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isResetting || isExiting}
            className="h-6 px-2 text-[11px] border-primary/30 hover:bg-primary/20 text-primary shrink-0 gap-1.5 font-medium"
          >
            {isResetting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3" />
            )}
            Ripristina Sandbox
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExitToPortfolio}
            disabled={isResetting || isExiting}
            className="h-6 px-2 text-[11px] border-primary/30 hover:bg-primary/20 text-primary shrink-0 gap-1.5 font-medium"
          >
            {isExiting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
            Torna al Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
}
