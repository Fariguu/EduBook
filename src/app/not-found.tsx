import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6">
        <FileQuestion className="h-10 w-10" />
      </div>
      <span className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
        Errore 404
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
        Pagina Non Trovata
      </h1>
      <p className="max-w-md text-sm sm:text-base text-muted-foreground mb-8">
        La pagina che stai cercando non esiste, è stata spostata o il link inserito non è corretto.
      </p>
      <Link href="/" className={buttonVariants({ variant: "default", className: "gap-2" })}>
        <Home className="h-4 w-4" />
        Torna alla Home
      </Link>
    </div>
  );
}
