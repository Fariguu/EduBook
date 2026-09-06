"use server";

import { z } from "zod";
import { requireAuth } from "@/features/auth/utils/require-auth";
import { createAdminClient } from "@/utils/supabase/server";
import { getDemoSessionId } from "@/lib/demo-session";
import {
  profileSchema,
  type ProfileInput,
  whyChooseUsSchema,
  type WhyChooseUsInput,
  heroCardSchema,
  type HeroCardInput,
} from "../schemas/profile.schema";
import { revalidatePath } from "next/cache";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

export interface CredentialsInput {
  email?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * Recupera i dati del profilo del professore autenticato.
 */
export async function getProfile() {
  await requireAuth();
  const sessionId = await getDemoSessionId();
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("profiles_demo")
      .select("id, first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, suggested_subjects, avatar_url, why_choose_us, hero_card")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error || !data) {
      console.error("[getProfile] Errore recupero:", error);
      return null;
    }

    return {
      ...data,
      authEmail: data.email || "mario.rossi@edubook.it",
    };
  } catch (err) {
    console.error("[getProfile] Errore inatteso:", err);
    return null;
  }
}

/**
 * Aggiorna i dati anagrafici, la biografia, i recapiti e le materie insegnate.
 */
export async function updateProfile(input: ProfileInput): Promise<ProfileActionResult> {
  await requireAuth();
  const sessionId = await getDemoSessionId();

  const validation = profileSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Dati profilo non validi",
    };
  }

  const { first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, suggested_subjects } = validation.data;
  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("profiles_demo")
      .update({
        first_name,
        last_name,
        headline: headline || "Docente di Scienze Matematiche",
        email,
        phone: phone || null,
        bio: bio || null,
        teaching_subjects,
        subject_details: subject_details || {},
        suggested_subjects: suggested_subjects || [],
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[updateProfile] Errore update:", error);
      return {
        success: false,
        error: "Impossibile aggiornare il profilo. Riprova più tardi.",
      };
    }

    // Revalidate tutte le pagine che mostrano dati del professore
    revalidatePath("/dashboard/profilo");
    revalidatePath("/dashboard");
    revalidatePath("/");
    revalidatePath("/prenota");
    revalidatePath("/contatti");

    return { success: true };
  } catch (err) {
    console.error("[updateProfile] Errore inatteso:", err);
    return {
      success: false,
      error: "Si è verificato un errore durante il salvataggio.",
    };
  }
}

/**
 * Aggiorna le credenziali di accesso del professore (email e/o password) nella sandbox demo.
 */
export async function updateCredentials(input: CredentialsInput): Promise<ProfileActionResult> {
  await requireAuth();
  const sessionId = await getDemoSessionId();
  const admin = createAdminClient();

  try {
    // Aggiornamento Email fittizia se fornita
    if (input.email?.trim()) {
      const normalizedEmail = input.email.trim().toLowerCase();
      const emailValidation = z
        .string()
        .email("Inserisci un indirizzo email valido")
        .safeParse(normalizedEmail);

      if (!emailValidation.success) {
        return {
          success: false,
          error: emailValidation.error.issues[0]?.message || "Email non valida",
        };
      }

      await admin
        .from("profiles_demo")
        .update({
          email: normalizedEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("session_id", sessionId);
    }

    revalidatePath("/dashboard/profilo");
    revalidatePath("/dashboard");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("[updateCredentials] Errore inatteso:", err);
    return {
      success: false,
      error: "Si è verificato un errore durante l'aggiornamento delle credenziali.",
    };
  }
}

/**
 * Aggiorna la configurazione personalizzata della sezione "Perché Scegliere Questo Percorso".
 */
export async function updateWhyChooseUs(input: WhyChooseUsInput): Promise<ProfileActionResult> {
  await requireAuth();
  const sessionId = await getDemoSessionId();

  const validation = whyChooseUsSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Dati sezione non validi",
    };
  }

  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("profiles_demo")
      .update({
        why_choose_us: validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[updateWhyChooseUs] Errore salvataggio:", error);
      return {
        success: false,
        error: "Impossibile salvare la sezione. Riprova più tardi.",
      };
    }

    revalidatePath("/");
    revalidatePath("/dashboard/profilo");
    return { success: true };
  } catch (err) {
    console.error("[updateWhyChooseUs] Errore inatteso:", err);
    return {
      success: false,
      error: "Si è verificato un errore durante il salvataggio della sezione.",
    };
  }
}

/**
 * Ripristina la sezione "Perché Scegliere Questo Percorso" ai valori predefiniti.
 */
export async function resetWhyChooseUs(): Promise<ProfileActionResult> {
  await requireAuth();
  const sessionId = await getDemoSessionId();
  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("profiles_demo")
      .update({
        why_choose_us: null,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[resetWhyChooseUs] Errore ripristino:", error);
      return {
        success: false,
        error: "Impossibile ripristinare i valori predefiniti.",
      };
    }

    revalidatePath("/");
    revalidatePath("/dashboard/profilo");
    return { success: true };
  } catch (err) {
    console.error("[resetWhyChooseUs] Errore inatteso:", err);
    return {
      success: false,
      error: "Si è verificato un errore durante il ripristino.",
    };
  }
}

/**
 * Aggiorna la configurazione personalizzata della scheda informativa Hero.
 */
export async function updateHeroCard(input: HeroCardInput): Promise<ProfileActionResult> {
  await requireAuth();
  const sessionId = await getDemoSessionId();

  const validation = heroCardSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Dati scheda non validi",
    };
  }

  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("profiles_demo")
      .update({
        hero_card: validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[updateHeroCard] Errore salvataggio:", error);
      return {
        success: false,
        error: "Impossibile salvare la scheda. Riprova più tardi.",
      };
    }

    revalidatePath("/");
    revalidatePath("/dashboard/profilo");
    return { success: true };
  } catch (err) {
    console.error("[updateHeroCard] Errore inatteso:", err);
    return {
      success: false,
      error: "Si è verificato un errore durante il salvataggio della scheda.",
    };
  }
}

/**
 * Ripristina la scheda informativa Hero ai valori predefiniti.
 */
export async function resetHeroCard(): Promise<ProfileActionResult> {
  await requireAuth();
  const sessionId = await getDemoSessionId();
  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("profiles_demo")
      .update({
        hero_card: null,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId);

    if (error) {
      console.error("[resetHeroCard] Errore ripristino:", error);
      return {
        success: false,
        error: "Impossibile ripristinare i valori predefiniti.",
      };
    }

    revalidatePath("/");
    revalidatePath("/dashboard/profilo");
    return { success: true };
  } catch (err) {
    console.error("[resetHeroCard] Errore inatteso:", err);
    return {
      success: false,
      error: "Si è verificato un errore durante il ripristino.",
    };
  }
}


