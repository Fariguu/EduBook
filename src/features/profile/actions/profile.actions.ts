"use server";

import { z } from "zod";
import { requireAuth } from "@/features/auth/utils/require-auth";
import { createAdminClient } from "@/utils/supabase/server";
import {
  profileSchema,
  type ProfileInput,
  whyChooseUsSchema,
  type WhyChooseUsInput,
} from "../schemas/profile.schema";
import { updatePasswordSchema } from "@/features/auth/schemas/auth.schema";
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
  const { user } = await requireAuth();
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("profiles")
      .select("id, first_name, last_name, headline, email, phone, bio, teaching_subjects, subject_details, suggested_subjects, avatar_url, why_choose_us")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      console.error("[getProfile] Errore recupero:", error);
      return null;
    }

    return {
      ...data,
      authEmail: user.email || data.email || "",
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

    // Sincronizza l'email in auth.users se modificata
    if (user.email && user.email.toLowerCase() !== email.toLowerCase()) {
      await admin.auth.admin.updateUserById(user.id, {
        email,
        email_confirm: true,
      });
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
 * Aggiorna le credenziali di accesso del professore (email e/o password).
 */
export async function updateCredentials(input: CredentialsInput): Promise<ProfileActionResult> {
  const { user } = await requireAuth();
  const admin = createAdminClient();

  try {
    // 1. Aggiornamento Email se fornita e modificata
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

      const { error: authError } = await admin.auth.admin.updateUserById(user.id, {
        email: normalizedEmail,
        email_confirm: true,
      });

      if (authError) {
        console.error("[updateCredentials] Errore update email auth:", authError);
        return {
          success: false,
          error: "Impossibile aggiornare l'email di accesso: " + authError.message,
        };
      }

      // Sincronizza anche la tabella dei profili
      await admin
        .from("profiles")
        .update({
          email: normalizedEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    // 2. Aggiornamento Password se fornita
    if (input.newPassword) {
      const passwordValidation = updatePasswordSchema.safeParse({
        newPassword: input.newPassword,
        confirmPassword: input.confirmPassword || "",
      });

      if (!passwordValidation.success) {
        return {
          success: false,
          error: passwordValidation.error.issues[0]?.message || "Password non valida",
        };
      }

      const { error: pwdError } = await admin.auth.admin.updateUserById(user.id, {
        password: input.newPassword,
      });

      if (pwdError) {
        console.error("[updateCredentials] Errore update password auth:", pwdError);
        return {
          success: false,
          error: "Impossibile aggiornare la password: " + pwdError.message,
        };
      }
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
  const { user } = await requireAuth();

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
      .from("profiles")
      .update({
        why_choose_us: validation.data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

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
  const { user } = await requireAuth();
  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("profiles")
      .update({
        why_choose_us: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

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

