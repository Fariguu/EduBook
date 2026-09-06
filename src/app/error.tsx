"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[GlobalError Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-wider text-destructive mb-2">
        Qualcosa è andato storto
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
        Errore Inatteso
      </h1>
      <p className="max-w-md text-sm sm:text-base text-muted-foreground mb-8">
        Si è verificato un errore durante l&apos;elaborazione della richiesta. Puoi riprovare o tornare alla pagina principale.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button onClick={() => reset()} variant="outline" className="gap-2">
          <RotateCw className="h-4 w-4" />
          Riprova
        </Button>
        <Link href="/">
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Home className="h-4 w-4" />
            Torna alla Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
