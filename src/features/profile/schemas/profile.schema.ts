import { z } from "zod";

export const profileSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, { message: "Il nome è obbligatorio" })
    .max(50, { message: "Il nome non può superare 50 caratteri" }),
  last_name: z
    .string()
    .trim()
    .min(1, { message: "Il cognome è obbligatorio" })
    .max(50, { message: "Il cognome non può superare 50 caratteri" }),
  headline: z
    .string()
    .trim()
    .max(100, { message: "Il titolo/qualifica non può superare 100 caratteri" })
    .optional()
    .nullable()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email({ message: "Inserisci un indirizzo email valido" }),
  phone: z
    .string()
    .trim()
    .max(30, { message: "Il recapito telefonico non può superare 30 caratteri" })
    .optional()
    .nullable()
    .or(z.literal("")),
  bio: z
    .string()
    .trim()
    .max(1000, { message: "La biografia non può superare 1000 caratteri" })
    .optional()
    .nullable()
    .or(z.literal("")),
  teaching_subjects: z
    .array(z.string().trim().min(1, { message: "Il nome della materia non può essere vuoto" }))
    .min(1, { message: "Inserisci almeno una materia d'insegnamento" }),
  subject_details: z.record(z.string(), z.string()).optional().nullable(),
  suggested_subjects: z.array(z.string().trim().min(1)).optional().nullable(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

export const whyChooseUsPillarSchema = z.object({
  icon: z.string().trim().min(1, { message: "L'icona è obbligatoria" }).default("Target"),
  title: z
    .string()
    .trim()
    .min(1, { message: "Il titolo del punto di forza è obbligatorio" })
    .max(80, { message: "Il titolo non può superare 80 caratteri" }),
  description: z
    .string()
    .trim()
    .min(1, { message: "La descrizione è obbligatoria" })
    .max(400, { message: "La descrizione non può superare 400 caratteri" }),
});

export const whyChooseUsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Il titolo della sezione è obbligatorio" })
    .max(120, { message: "Il titolo non può superare 120 caratteri" }),
  subtitle: z
    .string()
    .trim()
    .max(250, { message: "Il sottotitolo non può superare 250 caratteri" })
    .optional()
    .nullable()
    .or(z.literal("")),
  pillars: z
    .array(whyChooseUsPillarSchema)
    .min(1, { message: "Inserisci almeno un punto di forza" })
    .max(6, { message: "Puoi inserire al massimo 6 punti di forza" }),
});

export type WhyChooseUsInput = z.infer<typeof whyChooseUsSchema>;
