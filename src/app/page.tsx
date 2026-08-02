import { createClient } from "@/utils/supabase/server";
import { PublicNavbar } from "@/features/landing/components/PublicNavbar";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { SubjectBadges } from "@/features/landing/components/SubjectBadges";
import { BioSection } from "@/features/landing/components/BioSection";
import { CTASection } from "@/features/landing/components/CTASection";
import { Footer } from "@/features/landing/components/Footer";

export default async function Home() {
  let professorName = "Prof. Gabriele Farigu";
  let bio =
    "Docente qualificato con pluriennale esperienza nell'insegnamento di Matematica, Fisica e Analisi. Metodo personalizzato per scuola superiore e università.";
  let subjects = ["Matematica", "Fisica", "Analisi 1"];
  let isAuthenticated = false;

  try {
    const supabase = await createClient();

    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
    }

    // Fetch professor profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, bio, teaching_subjects")
      .limit(1)
      .maybeSingle();

    if (profile) {
      if (profile.first_name || profile.last_name) {
        professorName = `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
      }
      if (profile.bio) {
        bio = profile.bio;
      }
      if (profile.teaching_subjects && profile.teaching_subjects.length > 0) {
        subjects = profile.teaching_subjects;
      }
    }
  } catch {
    // Graceful fallback to default values
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <HeroSection professorName={professorName} bio={bio} subjects={subjects} />
        <SubjectBadges subjects={subjects} />
        <BioSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
