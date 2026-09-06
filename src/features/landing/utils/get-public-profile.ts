import { createClient } from "@/utils/supabase/server";

export interface PublicProfessorProfile {
  isAuthenticated: boolean;
  professorName: string;
  headline: string;
  email: string;
  phone: string | null;
  bio: string;
  subjects: string[];
  subjectDetails: Record<string, string>;
}

interface RawProfileData {
  first_name?: string | null;
  last_name?: string | null;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  teaching_subjects?: string[] | null;
  subject_details?: Record<string, string> | null;
}

const DEFAULT_PROFILE: Omit<PublicProfessorProfile, "isAuthenticated"> = {
  professorName: "Prof. Gabriele Farigu",
  headline: "Docente di Scienze Matematiche",
  email: "info@edubook.it",
  phone: null,
  bio: "Docente qualificato con pluriennale esperienza nell'insegnamento di Matematica, Fisica e Analisi. Metodo personalizzato per scuola superiore e università.",
  subjects: ["Matematica", "Fisica", "Analisi 1"],
  subjectDetails: {},
};

function parseProfile(profile: RawProfileData | null): Omit<PublicProfessorProfile, "isAuthenticated"> {
  if (!profile) return DEFAULT_PROFILE;

  const hasName = Boolean(profile.first_name || profile.last_name);
  const formattedName = `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();

  return {
    professorName: hasName ? formattedName : DEFAULT_PROFILE.professorName,
    headline: profile.headline || DEFAULT_PROFILE.headline,
    email: profile.email || DEFAULT_PROFILE.email,
    phone: profile.phone ?? DEFAULT_PROFILE.phone,
    bio: profile.bio || DEFAULT_PROFILE.bio,
    subjects: profile.teaching_subjects?.length ? profile.teaching_subjects : DEFAULT_PROFILE.subjects,
    subjectDetails:
      profile.subject_details && typeof profile.subject_details === "object"
        ? profile.subject_details
        : DEFAULT_PROFILE.subjectDetails,
  };
}

export async function getPublicProfessorProfile(): Promise<PublicProfessorProfile> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details")
      .limit(1)
      .maybeSingle();

    return {
      isAuthenticated: Boolean(user),
      ...parseProfile(profile),
    };
  } catch (err) {
    console.error("[getPublicProfessorProfile] Errore recupero profilo:", err);
    return {
      isAuthenticated: false,
      ...DEFAULT_PROFILE,
    };
  }
}
