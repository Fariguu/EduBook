import { Metadata } from "next";
import { PublicLayout } from "@/features/landing/components/PublicLayout";
import { ManageBooking } from "@/features/booking/components/ManageBooking";
import { getLessonById } from "@/features/booking/actions/manage.actions";
import { getPublicProfessorProfile } from "@/features/landing/utils/get-public-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircleIcon, CalendarIcon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Gestisci Prenotazione | EduBook",
  description: "Visualizza lo stato della tua lezione privata o richiedi una modifica di orario.",
};

export const revalidate = 0;

export default async function GestisciPrenotazionePage({ params }: PageProps) {
  const { id } = await params;
  const [lesson, { isAuthenticated, professorName }] = await Promise.all([
    getLessonById(id),
    getPublicProfessorProfile(),
  ]);

  return (
    <PublicLayout isAuthenticated={isAuthenticated} maxWidth="4xl">
      {!lesson ? (
        <div className="max-w-md mx-auto py-12">
          <Card className="border-border text-center shadow-sm p-6">
            <CardContent className="space-y-4 pt-4">
              <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <AlertCircleIcon className="w-8 h-8" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Prenotazione Non Trovata</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Il codice lezione fornito non corrisponde a nessuna prenotazione attiva, oppure il
                link potrebbe essere scaduto o errato.
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 justify-center">
                <Link href="/prenota">
                  <Button className="w-full bg-primary text-white hover:bg-primary/90 text-sm">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Prenota una Lezione
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full text-sm">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Torna alla Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ManageBooking lesson={lesson} professorName={professorName} />
      )}
    </PublicLayout>
  );
}
