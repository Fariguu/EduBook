"use server";

import { createAdminClient } from "@/utils/supabase/server";
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

    const adminClient = createAdminClient();

    // 3. Salvataggio nel database (tabella contacts)
    const { error: dbError } = await adminClient.from("contacts").insert({
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
      .from("profiles")
      .select("email")
      .limit(1)
      .maybeSingle();

    const profEmail =
      profProfile?.email || process.env.PROFESSOR_NOTIFICATION_EMAIL || "info@edubook.it";

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
