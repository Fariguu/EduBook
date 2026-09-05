import type { Lesson } from "@/features/booking/types/booking.types";

export interface DashboardStatsData {
  pendingCount: number;
  confirmedCount: number;
  availableCount: number;
  contactsCount: number;
}

export type DashboardLesson = Lesson;

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface DashboardData {
  stats: DashboardStatsData;
  pendingLessons: DashboardLesson[];
  confirmedLessons: DashboardLesson[];
  availableSlots: DashboardLesson[];
  contactMessages: ContactMessage[];
  professorName: string;
}

export interface DashboardActionResult {
  success: boolean;
  error?: string;
  count?: number;
}
