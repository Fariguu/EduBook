"use server";

import { requireAuth } from "@/features/auth/utils/require-auth";
import { createAdminClient } from "@/utils/supabase/server";
import { profileSchema, type ProfileInput } from "../schemas/profile.schema";
import { revalidatePath } from "next/cache";

export interface ProfileActionResult {
  success: boolean;
  error?: string;
}

/**
 * Recupera i dati del profilo del professore autenticato.
 */
export async function getProfile() {
  const { user } = await requireAuth();
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("profiles")
      .select("id, first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, suggested_subjects, avatar_url")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("[getProfile] Errore recupero:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("[getProfile] Errore inatteso:", err);
    return null;
  }
}

/**
 * Aggiorna i dati anagrafici, la biografia, i recapiti e le materie insegnate.
 */
export async function updateProfile(input: ProfileInput): Promise<ProfileActionResult> {
  const { user } = await requireAuth();

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
      .from("profiles")
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
      .eq("id", user.id);

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
