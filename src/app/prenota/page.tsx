import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/features/landing/components/PublicNavbar";
import { Footer } from "@/features/landing/components/Footer";
import { BookingCalendar } from "@/features/booking/components/BookingCalendar";
import { getAvailableSlots } from "@/features/booking/actions/booking.actions";

export const metadata: Metadata = {
  title: "Prenota una Lezione | EduBook",
  description:
    "Scegli una data disponibile e prenota la tua lezione individuale in pochi semplici passaggi.",
};

export const revalidate = 0; // Contenuto dinamico sempre aggiornato

export default async function PrenotaPage() {
  const slots = await getAvailableSlots();

  let isAuthenticated = false;
  let professorName = "il Professore";

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .limit(1)
      .maybeSingle();

    if (profile?.first_name || profile?.last_name) {
      professorName = `il Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
    }
  } catch (err) {
    console.error("[PrenotaPage] Errore recupero profilo:", err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            Prenota una Lezione
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Scegli il giorno e la fascia oraria più comoda con {professorName}. Nessuna registrazione
            richiesta: puoi prenotare rapidamente come ospite.
          </p>
        </div>

        <BookingCalendar initialSlots={slots} professorName={professorName} />
      </main>
      <Footer />
    </div>
  );
}
