import { z } from "zod";

export const bookingSchema = z.object({
  slotId: z.string().uuid({ message: "Identificativo slot non valido" }),
  startTime: z.string().min(1, { message: "Orario di inizio richiesto" }),
  endTime: z.string().min(1, { message: "Orario di fine richiesto" }),
  guestName: z
    .string()
    .trim()
    .min(2, { message: "Il nome deve contenere almeno 2 caratteri" })
    .max(100, { message: "Il nome non può superare 100 caratteri" }),
  guestEmail: z
    .string()
    .trim()
    .email({ message: "Inserisci un indirizzo email valido" }),
  notes: z
    .string()
    .trim()
    .max(500, { message: "Le note non possono superare 500 caratteri" })
    .optional()
    .or(z.literal("")),
  turnstileToken: z.string().optional().nullable(),
});

export type BookingSchemaInput = z.infer<typeof bookingSchema>;

export const rescheduleSchema = z.object({
  lessonId: z.string().uuid({ message: "Identificativo lezione non valido" }),
  rescheduleNotes: z
    .string()
    .trim()
    .min(5, { message: "Indica una motivazione o fasce orarie alternative (almeno 5 caratteri)" })
    .max(500, { message: "La motivazione non può superare 500 caratteri" }),
  turnstileToken: z.string().optional().nullable(),
});

export type RescheduleSchemaInput = z.infer<typeof rescheduleSchema>;
