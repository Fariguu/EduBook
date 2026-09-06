import { Metadata } from "next";
import { getProfile } from "@/features/profile/actions/profile.actions";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { WhyChooseUsCard } from "@/features/profile/components/WhyChooseUsCard";
import { CredentialsCard } from "@/features/profile/components/CredentialsCard";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modifica Profilo | EduBook Dashboard",
  description: "Aggiorna le informazioni personali, i recapiti, le credenziali e le materie insegnate.",
};

export const dynamic = "force-dynamic";

export default async function ProfiloPage() {
  const profile = await getProfile();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Intestazione e ritorno */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Torna alla Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Gestione Profilo Docente
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Aggiorna la tua presentazione, le materie insegnate, i recapiti e le credenziali di accesso.
          </p>
        </div>
      </div>

      <ProfileForm initialProfile={profile} />

      {/* Personalizzazione Sezione "Perché Scegliere Questo Percorso" */}
      <WhyChooseUsCard initialData={profile?.why_choose_us} />

      {/* Sezione Credenziali di Accesso e Sicurezza */}
      <CredentialsCard initialEmail={profile?.authEmail || profile?.email || ""} />
    </div>
  );
}
