import { Metadata } from "next";
import { PublicLayout } from "@/features/landing/components/PublicLayout";
import { BookingCalendar } from "@/features/booking/components/BookingCalendar";
import { getAvailableSlots } from "@/features/booking/actions/booking.actions";
import { getPublicProfessorProfile } from "@/features/landing/utils/get-public-profile";

export const metadata: Metadata = {
  title: "Prenota una Lezione | EduBook",
  description:
    "Scegli una data disponibile e prenota la tua lezione individuale in pochi semplici passaggi.",
};

export const revalidate = 0; // Contenuto dinamico sempre aggiornato

export default async function PrenotaPage() {
  const slots = await getAvailableSlots();
  const { isAuthenticated, professorName } = await getPublicProfessorProfile();

  return (
    <PublicLayout isAuthenticated={isAuthenticated} maxWidth="6xl">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
          Prenota una Lezione
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Scegli il giorno e la fascia oraria più comoda con {professorName}. Nessuna registrazione
          richiesta: puoi prenotare rapidamente come ospite.
        </p>
      </div>

      <BookingCalendar initialSlots={slots} professorName={professorName} />
    </PublicLayout>
  );
}
