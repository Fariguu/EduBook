"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/features/auth/utils/require-auth";
import { createAdminClient } from "@/utils/supabase/server";
import {
  createSlotSchema,
  editLessonTimeSchema,
  rejectLessonSchema,
  cancelLessonSchema,
  type CreateSlotInput,
  type EditLessonTimeInput,
  type RejectLessonInput,
  type CancelLessonInput,
} from "../schemas/dashboard.schema";
import type { DashboardData, DashboardActionResult } from "../types/dashboard.types";
import { sendEmail } from "@/lib/resend";
import {
  lessonConfirmedStudentEmail,
  lessonRejectedStudentEmail,
  lessonTimeUpdatedStudentEmail,
  lessonCancelledStudentEmail,
} from "@/lib/email-templates";
import { addWeeks, differenceInWeeks } from "date-fns";
import {
  fetchLessonById,
  formatLessonDates,
  getProfessorDisplayName,
  getLessonUrls,
  revalidateLessonPaths,
  resetSlotToAvailable,
} from "../utils/lesson-action-helpers";

/**
 * Recupera tutti i dati necessari per la dashboard del professore.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const { profile } = await requireAuth();
  const admin = createAdminClient();

  const nowIso = new Date().toISOString();

  // Query in parallelo per massima reattività
  const [pendingRes, confirmedRes, availableRes, contactsRes] = await Promise.all([
    admin
      .from("lessons")
      .select("*")
      .eq("status", "pending")
      .order("start_time", { ascending: true }),

    admin
      .from("lessons")
      .select("*")
      .eq("status", "confirmed")
      .order("start_time", { ascending: true }),

    admin
      .from("lessons")
      .select("*")
      .eq("status", "available")
      .eq("is_available", true)
      .gte("start_time", nowIso)
      .order("start_time", { ascending: true }),

    admin
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const pendingLessons = pendingRes.data || [];
  const confirmedLessons = confirmedRes.data || [];
  const availableSlots = availableRes.data || [];
  const contactMessages = contactsRes.data || [];

  const professorName =
    profile?.first_name || profile?.last_name
      ? `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : "Professore";

  return {
    stats: {
      pendingCount: pendingLessons.length,
      confirmedCount: confirmedLessons.length,
      availableCount: availableSlots.length,
      contactsCount: contactMessages.length,
    },
    pendingLessons,
    confirmedLessons,
    availableSlots,
    contactMessages,
    professorName,
  };
}

/**
 * Crea uno o più slot di disponibilità (singolo o ricorrente settimanale).
 */
export async function createSlot(input: CreateSlotInput): Promise<DashboardActionResult> {
  await requireAuth();

  const validation = createSlotSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Dati slot non validi" };
  }

  const { startTime, endTime, isRecurring, recurrenceEndDate } = validation.data;
  const admin = createAdminClient();

  try {
    if (!isRecurring || !recurrenceEndDate) {
      // Slot singolo
      const { error } = await admin.from("lessons").insert({
        start_time: startTime,
        end_time: endTime,
        status: "available",
        is_available: true,
      });

      if (error) {
        console.error("[createSlot] Errore inserimento singolo:", error);
        return { success: false, error: "Impossibile creare lo slot." };
      }

      revalidatePath("/dashboard");
      revalidatePath("/prenota");
      return { success: true, count: 1 };
    }

    // Slot ricorrente: ripete ogni 7 giorni fino alla data limite
    const startInitial = new Date(startTime);
    const endInitial = new Date(endTime);
    const recEnd = new Date(recurrenceEndDate);

    const weeksDiff = Math.min(differenceInWeeks(recEnd, startInitial) + 1, 52); // Limite di sicurezza: max 52 settimane

    const slotsToInsert = [];
    for (let i = 0; i <= weeksDiff; i++) {
      const curStart = addWeeks(startInitial, i);
      const curEnd = addWeeks(endInitial, i);

      if (curStart.getTime() > recEnd.getTime()) break;

      slotsToInsert.push({
        start_time: curStart.toISOString(),
        end_time: curEnd.toISOString(),
        status: "available",
        is_available: true,
      });
    }

    if (slotsToInsert.length === 0) {
      return { success: false, error: "Nessuno slot generato con i parametri indicati." };
    }

    const { error } = await admin.from("lessons").insert(slotsToInsert);

    if (error) {
      console.error("[createSlot] Errore inserimento batch ricorrente:", error);
      return { success: false, error: "Impossibile creare la serie di slot ricorrenti." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/prenota");
    return { success: true, count: slotsToInsert.length };
  } catch (err) {
    console.error("[createSlot] Errore inatteso:", err);
    return { success: false, error: "Errore imprevisto durante la creazione." };
  }
}

/**
 * Elimina uno slot di disponibilità (solo se status = 'available').
 */
export async function removeAvailableSlot(slotId: string): Promise<DashboardActionResult> {
  await requireAuth();

  const admin = createAdminClient();

  try {
    const { error } = await admin
      .from("lessons")
      .delete()
      .eq("id", slotId)
      .eq("status", "available");

    if (error) {
      console.error("[removeAvailableSlot] Errore delete:", error);
      return { success: false, error: "Impossibile rimuovere lo slot." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/prenota");
    return { success: true };
  } catch (err) {
    console.error("[removeAvailableSlot] Errore inatteso:", err);
    return { success: false, error: "Errore durante l'eliminazione dello slot." };
  }
}

/**
 * Conferma una lezione richiesta da uno studente guest.
 */
export async function confirmLesson(lessonId: string): Promise<DashboardActionResult> {
  const { profile } = await requireAuth();
  const admin = createAdminClient();

  try {
    const { error: fetchErr, lesson } = await fetchLessonById(admin, lessonId);
    if (fetchErr || !lesson) {
      return { success: false, error: fetchErr || "Lezione non trovata." };
    }

    const { error: updateErr } = await admin
      .from("lessons")
      .update({
        status: "confirmed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) {
      console.error("[confirmLesson] Errore update:", updateErr);
      return { success: false, error: "Impossibile confermare la lezione." };
    }

    if (lesson.guest_email) {
      const profName = getProfessorDisplayName(profile);
      const { startDate, endDate, formattedDate, formattedStartTime, formattedEndTime } =
        formatLessonDates(lesson.start_time, lesson.end_time);
      const { manageUrl, googleCalendarUrl } = getLessonUrls(
        lessonId,
        profName,
        startDate,
        endDate
      );

      await sendEmail({
        to: lesson.guest_email,
        subject: "🎉 La tua lezione è confermata! - EduBook",
        html: lessonConfirmedStudentEmail({
          guestName: lesson.guest_name || "Studente",
          formattedDate,
          formattedStartTime,
          formattedEndTime,
          googleCalendarUrl,
          manageUrl,
        }),
      });
    }

    revalidateLessonPaths(lessonId);
    return { success: true };
  } catch (err) {
    console.error("[confirmLesson] Errore inatteso:", err);
    return { success: false, error: "Errore durante la conferma della lezione." };
  }
}

/**
 * Rifiuta una prenotazione, liberando lo slot per altri studenti e notificando il guest.
 */
export async function rejectLesson(input: RejectLessonInput): Promise<DashboardActionResult> {
  await requireAuth();

  const validation = rejectLessonSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Dati non validi" };
  }

  const { lessonId, reason } = validation.data;
  const admin = createAdminClient();

  try {
    const { error: fetchErr, lesson } = await fetchLessonById(admin, lessonId);
    if (fetchErr || !lesson) {
      return { success: false, error: fetchErr || "Lezione non trovata." };
    }

    const guestEmail = lesson.guest_email;
    const guestName = lesson.guest_name || "Studente";
    const { formattedDate, formattedStartTime, formattedEndTime } = formatLessonDates(
      lesson.start_time,
      lesson.end_time
    );

    const { error: resetErr } = await resetSlotToAvailable(admin, lessonId);

    if (resetErr) {
      console.error("[rejectLesson] Errore reset slot:", resetErr);
      return { success: false, error: "Impossibile aggiornare lo slot." };
    }

    if (guestEmail) {
      await sendEmail({
        to: guestEmail,
        subject: "Aggiornamento richiesta lezione - EduBook",
        html: lessonRejectedStudentEmail({
          guestName,
          formattedDate,
          formattedStartTime,
          formattedEndTime,
          reason,
        }),
      });
    }

    revalidateLessonPaths(lessonId);
    return { success: true };
  } catch (err) {
    console.error("[rejectLesson] Errore inatteso:", err);
    return { success: false, error: "Errore durante il rifiuto della prenotazione." };
  }
}

/**
 * Modifica l'orario di una lezione e notifica lo studente.
 */
export async function updateLessonTime(input: EditLessonTimeInput): Promise<DashboardActionResult> {
  const { profile } = await requireAuth();

  const validation = editLessonTimeSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Orari non validi" };
  }

  const { lessonId, newStartTime, newEndTime } = validation.data;
  const admin = createAdminClient();

  try {
    const { error: fetchErr, lesson } = await fetchLessonById(admin, lessonId);
    if (fetchErr || !lesson) {
      return { success: false, error: fetchErr || "Lezione non trovata." };
    }

    const { error: updateErr } = await admin
      .from("lessons")
      .update({
        start_time: newStartTime,
        end_time: newEndTime,
        reschedule_requested: false,
        reschedule_notes: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId);

    if (updateErr) {
      console.error("[updateLessonTime] Errore aggiornamento orario:", updateErr);
      return { success: false, error: "Impossibile aggiornare l'orario della lezione." };
    }

    if (lesson.guest_email) {
      const profName = getProfessorDisplayName(profile);
      const { startDate, endDate, formattedDate, formattedStartTime, formattedEndTime } =
        formatLessonDates(newStartTime, newEndTime);
      const { manageUrl, googleCalendarUrl } = getLessonUrls(
        lessonId,
        profName,
        startDate,
        endDate
      );

      await sendEmail({
        to: lesson.guest_email,
        subject: "Orario Lezione Aggiornato - EduBook",
        html: lessonTimeUpdatedStudentEmail({
          guestName: lesson.guest_name || "Studente",
          formattedDate,
          formattedStartTime,
          formattedEndTime,
          googleCalendarUrl,
          manageUrl,
        }),
      });
    }

    revalidateLessonPaths(lessonId);
    return { success: true };
  } catch (err) {
    console.error("[updateLessonTime] Errore inatteso:", err);
    return { success: false, error: "Errore durante l'aggiornamento dell'orario." };
  }
}

/**
 * Annulla una lezione già confermata, con scelta se mantenere lo slot libero o eliminarlo.
 */
export async function cancelLessonWithChoice(
  input: CancelLessonInput
): Promise<DashboardActionResult> {
  await requireAuth();

  const validation = cancelLessonSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0]?.message || "Parametri non validi" };
  }

  const { lessonId, keepAvailable } = validation.data;
  const admin = createAdminClient();

  try {
    const { error: fetchErr, lesson } = await fetchLessonById(admin, lessonId);
    if (fetchErr || !lesson) {
      return { success: false, error: fetchErr || "Lezione non trovata." };
    }

    const guestEmail = lesson.guest_email;
    const guestName = lesson.guest_name || "Studente";
    const { formattedDate, formattedStartTime, formattedEndTime } = formatLessonDates(
      lesson.start_time,
      lesson.end_time
    );

    if (keepAvailable) {
      const { error: resetErr } = await resetSlotToAvailable(admin, lessonId);

      if (resetErr) {
        console.error("[cancelLessonWithChoice] Errore reset:", resetErr);
        return { success: false, error: "Impossibile resettare lo slot." };
      }
    } else {
      const { error: deleteErr } = await admin
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (deleteErr) {
        console.error("[cancelLessonWithChoice] Errore delete:", deleteErr);
        return { success: false, error: "Impossibile eliminare la lezione." };
      }
    }

    if (guestEmail) {
      await sendEmail({
        to: guestEmail,
        subject: "Lezione Annullata - EduBook",
        html: lessonCancelledStudentEmail({
          guestName,
          formattedDate,
          formattedStartTime,
          formattedEndTime,
        }),
      });
    }

    revalidateLessonPaths(lessonId);
    return { success: true };
  } catch (err) {
    console.error("[cancelLessonWithChoice] Errore inatteso:", err);
    return { success: false, error: "Errore durante l'annullamento della lezione." };
  }
}
