"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { rescheduleSchema, type RescheduleSchemaInput } from "../schemas/booking.schema";
import type { Lesson, RescheduleResult } from "../types/booking.types";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/resend";
import { rescheduleRequestEmail } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Recupera i dettagli di una lezione prenotata tramite il suo UUID (funge da access token).
 */
export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    // Validazione UUID per prevenire injection e query malformate
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      return null;
    }

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
      .from("lessons")
      .select(
        "id, start_time, end_time, is_available, status, guest_name, guest_email, notes, reschedule_requested, reschedule_notes, created_at, updated_at"
      )
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return data as Lesson;
  } catch (error) {
    console.error("[getLessonById] Errore recupero lezione:", error);
    return null;
  }
}

/**
 * Registra una richiesta di spostamento della lezione da parte dello studente guest.
 */
export async function requestReschedule(input: RescheduleSchemaInput): Promise<RescheduleResult> {
  try {
    // 1. Validazione schema
    const validation = rescheduleSchema.safeParse(input);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Dati non validi";
      return { success: false, error: errorMsg };
    }

    const { lessonId, rescheduleNotes, turnstileToken } = validation.data;

    // 2. Verifica Turnstile
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return {
        success: false,
        error: "Verifica anti-spam non superata. Riprova.",
      };
    }

    const adminClient = createAdminClient();

    // 3. Verifica esistenza lezione
    const { data: lesson, error: fetchError } = await adminClient
      .from("lessons")
      .select("id, start_time, end_time, guest_name, guest_email, reschedule_requested")
      .eq("id", lessonId)
      .maybeSingle();

    if (fetchError || !lesson) {
      return {
        success: false,
        error: "Lezione non trovata o codice non valido.",
      };
    }

    if (lesson.reschedule_requested) {
      return {
        success: false,
        error: "Una richiesta di spostamento è già stata inoltrata per questa lezione.",
      };
    }

    // 4. Aggiorna lo stato della lezione
    const { error: updateError } = await adminClient
      .from("lessons")
      .update({
        reschedule_requested: true,
        reschedule_notes: rescheduleNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateError) {
      console.error("[requestReschedule] Errore update:", updateError);
      return {
        success: false,
        error: "Impossibile aggiornare la prenotazione. Riprova più tardi.",
      };
    }

    // 5. Invia notifica email al professore
    const { data: profProfile } = await adminClient
      .from("profiles")
      .select("email")
      .limit(1)
      .maybeSingle();

    const profEmail = profProfile?.email || process.env.PROFESSOR_NOTIFICATION_EMAIL || "info@edubook.it";

    const startDate = new Date(lesson.start_time);
    const formattedDate = format(startDate, "EEEE d MMMM yyyy", { locale: it });
    const formattedTime = `${format(startDate, "HH:mm")} - ${format(new Date(lesson.end_time), "HH:mm")}`;

    await sendEmail({
      to: profEmail,
      subject: `⚠️ Richiesta Spostamento Lezione da ${lesson.guest_name || "Studente"}`,
      html: rescheduleRequestEmail({
        guestName: lesson.guest_name || "Studente Guest",
        guestEmail: lesson.guest_email || "Nessuna email fornita",
        formattedDate,
        formattedTime,
        reason: rescheduleNotes,
        lessonId,
      }),
    });

    // 6. Revalidate cache pagina
    revalidatePath(`/gestisci/${lessonId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("[requestReschedule] Errore inatteso:", error);
    return {
      success: false,
      error: "Si è verificato un errore durante la richiesta. Riprova più tardi.",
    };
  }
}
