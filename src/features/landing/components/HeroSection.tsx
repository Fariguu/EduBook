import Link from "next/link";
import { Calendar, Mail, Sparkles, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroSectionProps {
  professorName?: string;
  bio?: string;
  subjects?: string[];
}

export function HeroSection({
  professorName = "Prof. Gabriele Farigu",
  bio = "Docente qualificato con pluriennale esperienza nell'insegnamento di Matematica, Fisica e Analisi. Metodo personalizzato per scuola superiore e università.",
  subjects = ["Matematica", "Fisica", "Analisi 1"],
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-b from-background via-muted/30 to-background transition-colors">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 border-primary/40 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Lezioni Private Individuali
              </Badge>
              <Badge variant="outline" className="px-3 py-1 border-secondary/40 bg-secondary/10 text-secondary rounded-full text-xs font-medium hidden sm:inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Modalità Online & Presenza
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
              Raggiungi i tuoi obiettivi accademici con{" "}
              <span className="text-primary underline decoration-primary/30 decoration-wavy underline-offset-8">
                {professorName}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {bio}
            </p>

            {/* Quick Subjects List */}
            {subjects.length > 0 && (
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
                  Materie:
                </span>
                {subjects.map((sub) => (
                  <Badge key={sub} className="bg-secondary/15 text-secondary hover:bg-secondary/25 border-none px-3 py-1 font-medium text-xs">
                    {sub}
                  </Badge>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/prenota">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-base px-6 h-12 shadow-md shadow-primary/20">
                  <Calendar className="w-5 h-5" />
                  Prenota una Lezione
                </Button>
              </Link>

              <Link href="/contatti">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-border hover:bg-muted text-foreground text-base px-6 h-12">
                  <Mail className="w-5 h-5 text-secondary" />
                  Invia un Messaggio
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative Visual Component */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Glow Background */}
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-primary via-secondary to-accent opacity-30 blur-xl"></div>
              
              <div className="relative rounded-2xl border border-border bg-background p-6 shadow-xl space-y-6">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-bold text-xl shadow-inner">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{professorName}</h3>
                    <p className="text-sm text-muted-foreground">Docente di Scienze Matematiche</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <span className="font-medium text-foreground">Lezioni disponibili</span>
                    <span className="text-primary font-semibold">Online & In Presenza</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <span className="font-medium text-foreground">Prenotazione</span>
                    <span className="text-secondary font-semibold">Diretta & Istantanea</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
                    <span className="font-medium text-foreground">Flessibilità</span>
                    <span className="text-foreground font-semibold">Slot Personalizzabili</span>
                  </div>
                </div>

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  Nessun account studente richiesto — prenotazione diretta in 2 minuti.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
