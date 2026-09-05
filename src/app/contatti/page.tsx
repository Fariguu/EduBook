import { Metadata } from "next";
import { PublicNavbar } from "@/features/landing/components/PublicNavbar";
import { Footer } from "@/features/landing/components/Footer";
import { ContactForm } from "@/features/contact/components/ContactForm";
import { getPublicProfessorProfile } from "@/features/landing/utils/get-public-profile";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MailIcon,
  PhoneIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contatti | EduBook",
  description:
    "Invia un messaggio diretto al docente per informazioni sui corsi, percorsi di studio o lezioni personalizzate.",
};

export const dynamic = "force-dynamic";

export default async function ContattiPage() {
  const { isAuthenticated, professorName, email, phone, subjects } =
    await getPublicProfessorProfile();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            Contatta il Docente
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Hai domande sui percorsi di studio, preparazione esami o necessità particolari? Compila
            il modulo o utilizza i recapiti sottostanti.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLONNA SINISTRA: Informazioni e Recapiti */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Docente
                  </span>
                  <h2 className="text-xl font-bold text-text mt-0.5">{professorName}</h2>
                </div>

                {subjects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Materie Principali
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {subjects.map((sub, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 text-xs font-medium"
                        >
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-border space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <MailIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Email diretta</span>
                      <a href={`mailto:${email}`} className="text-text font-medium hover:underline">
                        {email}
                      </a>
                    </div>
                  </div>

                  {phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <PhoneIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Telefono / WhatsApp</span>
                        <a href={`tel:${phone}`} className="text-text font-medium hover:underline">
                          {phone}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <ClockIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Tempo di Risposta</span>
                      <span className="text-text font-medium">Entro 24 ore lavorative</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <CheckCircle2Icon className="w-4 h-4" />
                    Supporto Personalizzato
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Possibilità di percorsi individuali continuativi, lezioni intensive pre-esame e
                    supporto compiti personalizzato.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* BOX RAPIDO PRENOTAZIONE */}
            <Card className="border-border bg-muted/30 shadow-sm">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-2 text-text font-bold text-base">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Preferisci prenotare direttamente?
                </div>
                <p className="text-xs text-muted-foreground">
                  Se conosci già la materia e l&apos;orario che desideri, puoi bloccare subito la
                  tua lezione nel calendario interattivo.
                </p>
                <Link href="/prenota" className="block pt-1">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90 text-sm">
                    Vai al Calendario Lezioni
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* COLONNA DESTRA: Modulo di Contatto */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
