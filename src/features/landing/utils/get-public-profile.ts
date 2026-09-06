import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/server";
import { getDemoSessionId, DEMO_AUTH_COOKIE } from "@/lib/demo-session";
import {
  DEFAULT_WHY_CHOOSE_US,
  type WhyChooseUsData,
} from "@/features/profile/constants/why-choose-us.constants";
import {
  DEFAULT_HERO_CARD,
  type HeroCardData,
} from "@/features/profile/constants/hero-card.constants";

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
  heroCard: HeroCardData;
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
  hero_card?: unknown;
}

const DEFAULT_PROFILE: Omit<PublicProfessorProfile, "isAuthenticated"> = {
  professorName: "Prof. Mario Rossi",
  headline: "Docente di Matematica e Fisica per Scuole Superiori e Universita",
  email: "mario.rossi@edubook.it",
  phone: "+39 340 1234567",
  bio: "Laureato con lode in Fisica Applicata, da oltre 8 anni supporto studenti di scuola superiore e universita nel superamento di debiti formativi ed esami universitari. Metodo pratico, personalizzato e orientato alla risoluzione autonoma dei problemi. Lezioni sia online con tavoletta grafica che in presenza.",
  subjects: ["Matematica", "Fisica", "Analisi 1", "Chimica"],
  subjectDetails: {
    Matematica: "Algebra, Geometria Analitica, Trigonometria, Goniometria e Studio di Funzione per scuole superiori.",
    Fisica: "Meccanica classica, Termodinamica, Elettromagnetismo e Ottica.",
    "Analisi 1": "Limiti, Derivate, Integrali definiti e indefiniti, Serie numeriche ed Equazioni Differenziali.",
    Chimica: "Stechiometria, Struttura atomica, Legami chimici e Reazioni acido-base.",
  },
  whyChooseUs: DEFAULT_WHY_CHOOSE_US,
  heroCard: DEFAULT_HERO_CARD,
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

function parseHeroCard(raw: unknown): HeroCardData {
  if (!raw || typeof raw !== "object") return DEFAULT_HERO_CARD;
  const obj = raw as Partial<HeroCardData>;
  if (!Array.isArray(obj.items) || obj.items.length === 0) {
    return DEFAULT_HERO_CARD;
  }
  return {
    items: obj.items.map((it) => ({
      label: typeof it.label === "string" ? it.label : "",
      value: typeof it.value === "string" ? it.value : "",
    })),
    footnote: typeof obj.footnote === "string" ? obj.footnote : DEFAULT_HERO_CARD.footnote,
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
    heroCard: parseHeroCard(profile.hero_card),
  };
}

export async function getPublicProfessorProfile(): Promise<PublicProfessorProfile> {
  try {
    const cookieStore = await cookies();
    const isDemoAuth = cookieStore.get(DEMO_AUTH_COOKIE)?.value === "true";
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();

    let { data: profile } = await admin
      .from("profiles_demo")
      .select("first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, why_choose_us, hero_card")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (!profile) {
      await admin.rpc("seed_demo_session", { p_session_id: sessionId });
      const seeded = await admin
        .from("profiles_demo")
        .select("first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, why_choose_us, hero_card")
        .eq("session_id", sessionId)
        .maybeSingle();
      profile = seeded.data;
    }

    return {
      isAuthenticated: isDemoAuth,
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

