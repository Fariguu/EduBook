import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/features/landing/components/PublicNavbar";
import { Footer } from "@/features/landing/components/Footer";
import { PrivacyContent } from "@/features/legal/components/PrivacyContent";

export const metadata: Metadata = {
  title: "Informativa sulla Privacy | EduBook",
  description:
    "Informativa completa sul trattamento dei dati personali e diritti dell'interessato ai sensi del Regolamento UE 2016/679 (GDPR).",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  let isAuthenticated = false;
  let professorName = "Prof. Gabriele Farigu";
  let professorEmail = "info@edubook.it";

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .limit(1)
      .maybeSingle();

    if (profile) {
      if (profile.first_name || profile.last_name) {
        professorName = `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
      }
      if (profile.email) {
        professorEmail = profile.email;
      }
    }
  } catch (err) {
    console.error("[PrivacyPage] Errore recupero profilo:", err);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <PrivacyContent professorName={professorName} professorEmail={professorEmail} />
      </main>
      <Footer />
    </div>
  );
}
