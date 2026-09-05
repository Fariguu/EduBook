import { createClient } from "@/utils/supabase/server";

export interface PublicProfessorProfile {
  isAuthenticated: boolean;
  professorName: string;
  headline: string;
  email: string;
  phone: string | null;
  bio: string;
  subjects: string[];
}

export async function getPublicProfessorProfile(): Promise<PublicProfessorProfile> {
  let isAuthenticated = false;
  let professorName = "Prof. Gabriele Farigu";
  let headline = "Docente di Scienze Matematiche";
  let email = "info@edubook.it";
  let phone: string | null = null;
  let bio =
    "Docente qualificato con pluriennale esperienza nell'insegnamento di Matematica, Fisica e Analisi. Metodo personalizzato per scuola superiore e università.";
  let subjects = ["Matematica", "Fisica", "Analisi 1"];

  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = Boolean(user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, headline, email, phone, bio, teaching_subjects")
      .limit(1)
      .maybeSingle();

    if (profile) {
      if (profile.first_name || profile.last_name) {
        professorName = `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
      }
      if (profile.headline) {
        headline = profile.headline;
      }
      if (profile.email) {
        email = profile.email;
      }
      if (profile.phone) {
        phone = profile.phone;
      }
      if (profile.bio) {
        bio = profile.bio;
      }
      if (profile.teaching_subjects && profile.teaching_subjects.length > 0) {
        subjects = profile.teaching_subjects;
      }
    }
  } catch (err) {
    console.error("[getPublicProfessorProfile] Errore recupero profilo:", err);
  }

  return {
    isAuthenticated,
    professorName,
    headline,
    email,
    phone,
    bio,
    subjects,
  };
}
