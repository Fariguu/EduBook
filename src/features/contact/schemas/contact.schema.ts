import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Il nome deve contenere almeno 2 caratteri" })
    .max(100, { message: "Il nome non può superare 100 caratteri" }),
  email: z
    .string()
    .trim()
    .email({ message: "Inserisci un indirizzo email valido" }),
  message: z
    .string()
    .trim()
    .min(10, { message: "Il messaggio deve contenere almeno 10 caratteri" })
    .max(2000, { message: "Il messaggio non può superare 2000 caratteri" }),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: "È necessario accettare l'informativa sulla privacy",
  }),
  turnstileToken: z.string().optional().nullable(),
});

export type ContactSchemaInput = z.infer<typeof contactSchema>;
