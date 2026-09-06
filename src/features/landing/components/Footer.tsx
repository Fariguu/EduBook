import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-muted/30 py-8 transition-colors">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-8 text-sm text-muted-foreground">
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">
              Edu<span className="text-primary">Book</span>
            </span>
            <span>© {new Date().getFullYear()} — Lezioni Private</span>
          </div>
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

        <div className="flex items-center gap-6">
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
