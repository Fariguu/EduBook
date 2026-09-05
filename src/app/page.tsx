import { PublicNavbar } from "@/features/landing/components/PublicNavbar";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { SubjectBadges } from "@/features/landing/components/SubjectBadges";
import { BioSection } from "@/features/landing/components/BioSection";
import { CTASection } from "@/features/landing/components/CTASection";
import { Footer } from "@/features/landing/components/Footer";
import { getPublicProfessorProfile } from "@/features/landing/utils/get-public-profile";

export default async function Home() {
  const { professorName, bio, subjects, isAuthenticated } = await getPublicProfessorProfile();

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
