export type LessonStatus = "available" | "pending" | "confirmed";

export interface Lesson {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: LessonStatus;
  student_id?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  notes?: string | null;
  reschedule_requested?: boolean;
  reschedule_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  status: LessonStatus | string;
}

export interface TimeSlotOption {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  label: string;
}

export interface BookingResult {
  success: boolean;
  lessonId?: string;
  error?: string;
}

export interface RescheduleResult {
  success: boolean;
  error?: string;
}
