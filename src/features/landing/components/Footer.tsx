import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/30 py-8 transition-colors">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 items-center gap-4 px-4 sm:px-8 text-sm text-muted-foreground">
        {/* Brand e Copyright (Sinistra) */}
        <div className="flex items-center justify-center md:justify-start gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shrink-0">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground">
            Edu<span className="text-primary">Book</span>
          </span>
          <span>© {new Date().getFullYear()} — Lezioni Private</span>
        </div>

        {/* Autore del Sito (Centro) */}
        <div className="flex items-center justify-center text-center">
          <p className="text-xs text-muted-foreground/80">
            Sito realizzato da{" "}
            <a
              href="https://gabrielefarigu.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-muted-foreground hover:text-primary transition-colors underline underline-offset-2 decoration-border hover:decoration-primary"
            >
              Gabriele Farigu
            </a>
          </p>
        </div>

        {/* Link di Navigazione (Destra) */}
        <div className="flex items-center justify-center md:justify-end gap-6">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/contatti" className="hover:text-primary transition-colors">
            Contattami
          </Link>
        </div>
      </div>
    </footer>
  );
}
