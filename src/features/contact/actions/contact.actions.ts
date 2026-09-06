"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { getDemoSessionId } from "@/lib/demo-session";
import { contactSchema, type ContactSchemaInput } from "../schemas/contact.schema";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/resend";
import { contactReceivedEmail } from "@/lib/email-templates";

export interface ContactActionResult {
  success: boolean;
  error?: string;
}

/**
 * Invia un messaggio dal form pubblico di contatto.
 * Valida i dati con Zod, verifica Turnstile, salva nel DB e invia email di notifica al docente.
 */
export async function sendContactMessage(input: ContactSchemaInput): Promise<ContactActionResult> {
  try {
    // 1. Validazione schema
    const validation = contactSchema.safeParse(input);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Dati del messaggio non validi";
      return { success: false, error: errorMsg };
    }

    const { name, email, message, turnstileToken } = validation.data;

    // 2. Verifica token anti-spam Turnstile
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return {
        success: false,
        error: "Verifica di sicurezza non superata. Ricarica la pagina e riprova.",
      };
    }

    const sessionId = await getDemoSessionId();
    const adminClient = createAdminClient();

    // 3. Salvataggio nel database sandbox (tabella contacts_demo)
    const { error: dbError } = await adminClient.from("contacts_demo").insert({
      session_id: sessionId,
      name,
      email,
      message,
    });

    if (dbError) {
      console.error("[sendContactMessage] Errore inserimento DB:", dbError);
      return {
        success: false,
        error: "Si è verificato un errore durante l'invio. Riprova più tardi.",
      };
    }

    // 4. Invio email di notifica al professore
    const { data: profProfile } = await adminClient
      .from("profiles_demo")
      .select("email")
      .eq("session_id", sessionId)
      .maybeSingle();

    const profEmail =
      profProfile?.email || process.env.PROFESSOR_NOTIFICATION_EMAIL || "mario.rossi@edubook.it";

    await sendEmail({
      to: profEmail,
      replyTo: email,
      subject: `Nuovo Messaggio da ${name} - EduBook`,
      html: contactReceivedEmail({
        name,
        email,
        message,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("[sendContactMessage] Errore inatteso:", error);
    return {
      success: false,
      error: "Si è verificato un errore imprevisto durante l'invio. Riprova più tardi.",
    };
  }
}

/**
 * Recupera l'elenco dei messaggi ricevuti dal modulo di contatto (riservato al docente).
 */
export async function getContactMessages() {
  const { requireAuth } = await import("@/features/auth/utils/require-auth");
  await requireAuth();

  try {
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("contacts_demo")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[getContactMessages] Errore recupero:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[getContactMessages] Errore inatteso:", err);
    return [];
  }
}

/**
 * Elimina un messaggio di contatto dalla dashboard.
 */
export async function deleteContactMessage(messageId: string): Promise<ContactActionResult> {
  const { requireAuth } = await import("@/features/auth/utils/require-auth");
  const { revalidatePath } = await import("next/cache");
  await requireAuth();

  try {
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();
    const { error } = await admin
      .from("contacts_demo")
      .delete()
      .eq("id", messageId)
      .eq("session_id", sessionId);

    if (error) {
      console.error("[deleteContactMessage] Errore cancellazione:", error);
      return { success: false, error: "Impossibile eliminare il messaggio." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("[deleteContactMessage] Errore inatteso:", err);
    return { success: false, error: "Errore durante l'eliminazione del messaggio." };
  }
}
