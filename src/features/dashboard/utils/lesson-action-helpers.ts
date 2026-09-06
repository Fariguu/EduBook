import { format } from "date-fns";
import { it } from "date-fns/locale";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";

export function formatGCalDate(date: Date): string {
  return date.toISOString().replace(/-|:|\.\d+/g, "");
}

export interface FormattedLessonDates {
  startDate: Date;
  endDate: Date;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
}

export function formatLessonDates(start: string | Date, end: string | Date): FormattedLessonDates {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return {
    startDate,
    endDate,
    formattedDate: format(startDate, "EEEE d MMMM yyyy", { locale: it }),
    formattedStartTime: format(startDate, "HH:mm"),
    formattedEndTime: format(endDate, "HH:mm"),
  };
}

export function getProfessorDisplayName(profile?: { first_name?: string | null; last_name?: string | null } | null): string {
  if (profile?.first_name || profile?.last_name) {
    return `Prof. ${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
  }
  return "il Professore";
}

export function getLessonUrls(lessonId: string, profName: string, startDate: Date, endDate: Date) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const manageUrl = `${siteUrl}/gestisci/${lessonId}`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    `Lezione con ${profName}`
  )}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${encodeURIComponent(
    `Lezione privata con ${profName}.\nID: ${lessonId}\nGestione: ${manageUrl}`
  )}`;

  return { siteUrl, manageUrl, googleCalendarUrl };
}

export function revalidateLessonPaths(lessonId?: string) {
  revalidatePath("/dashboard");
  if (lessonId) {
    revalidatePath(`/gestisci/${lessonId}`);
  }
  revalidatePath("/prenota");
}

export async function fetchLessonById(admin: SupabaseClient, lessonId: string) {
  const { data: lesson, error } = await admin
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  if (error || !lesson) {
    return { error: "Lezione non trovata.", lesson: null };
  }
  return { error: null, lesson };
}

export async function resetSlotToAvailable(admin: SupabaseClient, lessonId: string) {
  return await admin
    .from("lessons")
    .update({
      status: "available",
      is_available: true,
      student_id: null,
      guest_name: null,
      guest_email: null,
      notes: null,
      reschedule_requested: false,
      reschedule_notes: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId);
}


