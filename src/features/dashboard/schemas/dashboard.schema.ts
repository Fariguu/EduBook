import { z } from "zod";

export const createSlotSchema = z
  .object({
    startTime: z.string().min(1, { message: "Orario di inizio richiesto" }),
    endTime: z.string().min(1, { message: "Orario di fine richiesto" }),
    isRecurring: z.boolean().default(false),
    recurrenceEndDate: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
    },
    {
      message: "L'orario di fine deve essere successivo all'orario di inizio",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (data.isRecurring) {
        if (!data.recurrenceEndDate) return false;
        const start = new Date(data.startTime).getTime();
        const recEnd = new Date(data.recurrenceEndDate).getTime();
        return !Number.isNaN(recEnd) && recEnd > start;
      }
      return true;
    },
    {
      message: "Seleziona una data di fine ricorrenza valida e successiva allo slot iniziale",
      path: ["recurrenceEndDate"],
    }
  );

export type CreateSlotInput = z.infer<typeof createSlotSchema>;

export const editLessonTimeSchema = z
  .object({
    lessonId: z.string().uuid({ message: "Identificativo lezione non valido" }),
    newStartTime: z.string().min(1, { message: "Nuovo orario di inizio richiesto" }),
    newEndTime: z.string().min(1, { message: "Nuovo orario di fine richiesto" }),
  })
  .refine(
    (data) => {
      const start = new Date(data.newStartTime).getTime();
      const end = new Date(data.newEndTime).getTime();
      return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
    },
    {
      message: "L'orario di fine deve essere successivo all'orario di inizio",
      path: ["newEndTime"],
    }
  );

export type EditLessonTimeInput = z.infer<typeof editLessonTimeSchema>;

export const rejectLessonSchema = z.object({
  lessonId: z.string().uuid({ message: "Identificativo lezione non valido" }),
  reason: z
    .string()
    .trim()
    .max(500, { message: "La motivazione non può superare 500 caratteri" })
    .optional()
    .or(z.literal("")),
});

export type RejectLessonInput = z.infer<typeof rejectLessonSchema>;

export const cancelLessonSchema = z.object({
  lessonId: z.string().uuid({ message: "Identificativo lezione non valido" }),
  keepAvailable: z.boolean().default(false),
});

export type CancelLessonInput = z.infer<typeof cancelLessonSchema>;
