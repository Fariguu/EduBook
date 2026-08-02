import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 bg-primary/10 border-t border-border/40 transition-colors">
      <div className="container mx-auto px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Pronto a prenotare la tua prima lezione?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Scegli il giorno e l&apos;orario più comodo per te direttamente dal calendario disponibilità.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/prenota">
              <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 shadow-lg shadow-primary/25">
                <Calendar className="w-5 h-5" />
                Vedi Calendario Disponibilità
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
