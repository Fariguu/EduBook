"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { getDemoSessionId } from "@/lib/demo-session";
import { bookingSchema, type BookingSchemaInput } from "../schemas/booking.schema";
import type { AvailableSlot, BookingResult } from "../types/booking.types";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendEmail } from "@/lib/resend";
import { bookingConfirmationEmail } from "@/lib/email-templates";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { it } from "date-fns/locale";

/**
 * Recupera tutti gli slot disponibili per prenotazioni future.
 */
export async function getAvailableSlots(): Promise<AvailableSlot[]> {
  try {
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await admin
      .from("lessons_demo")
      .select("id, start_time, end_time, is_available, status")
      .eq("session_id", sessionId)
      .eq("is_available", true)
      .eq("status", "available")
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("[getAvailableSlots] Errore query:", error);
      return [];
    }

    return (data as AvailableSlot[]) || [];
  } catch (error) {
    console.error("[getAvailableSlots] Errore inatteso:", error);
    return [];
  }
}

/**
 * Effettua la prenotazione di uno slot (o frazione di Mega-Slot) da parte di uno studente guest.
 */
export async function bookLesson(input: BookingSchemaInput): Promise<BookingResult> {
  try {
    // 1. Validazione schema con Zod
    const validation = bookingSchema.safeParse(input);
    if (!validation.success) {
      const errorMsg = validation.error.issues[0]?.message || "Dati di prenotazione non validi";
      return { success: false, error: errorMsg };
    }

    const { slotId, startTime, endTime, guestName, guestEmail, notes, turnstileToken } =
      validation.data;

    // 2. Verifica token Turnstile
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return {
        success: false,
        error: "Verifica anti-spam fallita. Ricarica la pagina e riprova.",
      };
    }

    // 3. Esecuzione RPC split_and_book_slot_demo
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();

    const { data: rpcData, error: rpcError } = await admin.rpc("split_and_book_slot_demo", {
      p_session_id: sessionId,
      p_slot_id: slotId,
      p_req_start: startTime,
      p_req_end: endTime,
      p_notes: notes || null,
      p_guest_name: guestName,
      p_guest_email: guestEmail,
    });

    if (rpcError) {
      console.error("[bookLesson] Errore chiamata RPC:", rpcError);
      return {
        success: false,
        error: "Errore durante la prenotazione della lezione. Riprova più tardi.",
      };
    }

    // L'RPC restituisce un JSON tipo: { success: boolean, new_lesson_id?: string, error?: string }
    const result = rpcData as { success: boolean; new_lesson_id?: string; error?: string };

    if (!result || !result.success) {
      return {
        success: false,
        error: result?.error || "Lo slot selezionato non è più disponibile.",
      };
    }

    const newLessonId = result.new_lesson_id || slotId;

    // 4. Invio email di conferma con link di gestione
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const manageUrl = `${siteUrl}/gestisci/${newLessonId}`;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const formattedDate = format(startDate, "EEEE d MMMM yyyy", { locale: it });
    const formattedStartTime = format(startDate, "HH:mm");
    const formattedEndTime = format(endDate, "HH:mm");

    await sendEmail({
      to: guestEmail,
      subject: "Conferma Richiesta Prenotazione - EduBook",
      html: bookingConfirmationEmail({
        guestName,
        formattedDate,
        formattedStartTime,
        formattedEndTime,
        manageUrl,
      }),
    });

    // 5. Revalidate cache
    revalidatePath("/prenota");

    return {
      success: true,
      lessonId: newLessonId,
    };
  } catch (error) {
    console.error("[bookLesson] Errore inatteso:", error);
    return {
      success: false,
      error: "Si è verificato un errore imprevisto. Riprova più tardi.",
    };
  }
}
