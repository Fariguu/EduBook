import { Metadata } from "next";
import { PublicLayout } from "@/features/landing/components/PublicLayout";
import { PrivacyContent } from "@/features/legal/components/PrivacyContent";
import { getPublicProfessorProfile } from "@/features/landing/utils/get-public-profile";

export const metadata: Metadata = {
  title: "Informativa sulla Privacy | EduBook",
  description:
    "Informativa completa sul trattamento dei dati personali e diritti dell'interessato ai sensi del Regolamento UE 2016/679 (GDPR).",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const { isAuthenticated, professorName, email: professorEmail } =
    await getPublicProfessorProfile();

  return (
    <PublicLayout isAuthenticated={isAuthenticated} maxWidth="5xl">
      <PrivacyContent professorName={professorName} professorEmail={professorEmail} />
    </PublicLayout>
  );
}
