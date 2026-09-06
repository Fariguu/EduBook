import { createClient } from "@/utils/supabase/server";
import {
  DEFAULT_WHY_CHOOSE_US,
  type WhyChooseUsData,
} from "@/features/profile/constants/why-choose-us.constants";

export interface PublicProfessorProfile {
  isAuthenticated: boolean;
  professorName: string;
  headline: string;
  email: string;
  phone: string | null;
  bio: string;
  subjects: string[];
  subjectDetails: Record<string, string>;
  whyChooseUs: WhyChooseUsData;
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
  why_choose_us?: unknown;
}

const DEFAULT_PROFILE: Omit<PublicProfessorProfile, "isAuthenticated"> = {
  professorName: "Prof. Gabriele Farigu",
  headline: "Docente di Scienze Matematiche",
  email: "info@edubook.it",
  phone: null,
  bio: "Docente qualificato con pluriennale esperienza nell'insegnamento di Matematica, Fisica e Analisi. Metodo personalizzato per scuola superiore e università.",
  subjects: ["Matematica", "Fisica", "Analisi 1"],
  subjectDetails: {},
  whyChooseUs: DEFAULT_WHY_CHOOSE_US,
};

function parseWhyChooseUs(raw: unknown): WhyChooseUsData {
  if (!raw || typeof raw !== "object") return DEFAULT_WHY_CHOOSE_US;
  const obj = raw as Partial<WhyChooseUsData>;
  if (!obj.title || !Array.isArray(obj.pillars) || obj.pillars.length === 0) {
    return DEFAULT_WHY_CHOOSE_US;
  }
  return {
    title: obj.title || DEFAULT_WHY_CHOOSE_US.title,
    subtitle: typeof obj.subtitle === "string" ? obj.subtitle : DEFAULT_WHY_CHOOSE_US.subtitle,
    pillars: obj.pillars.map((p) => ({
      icon: p.icon || "Target",
      title: p.title || "",
      description: p.description || "",
    })),
  };
}

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
    whyChooseUs: parseWhyChooseUs(profile.why_choose_us),
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
      .select("first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, why_choose_us")
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

