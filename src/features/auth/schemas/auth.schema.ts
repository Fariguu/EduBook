import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email è obbligatoria" })
    .email({ message: "Inserisci un indirizzo email valido" }),
  password: z
    .string()
    .min(6, { message: "La password deve contenere almeno 6 caratteri" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email è obbligatoria" })
    .email({ message: "Inserisci un indirizzo email valido" }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const updatePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "La nuova password deve contenere almeno 8 caratteri" })
      .regex(/[A-Z]/, { message: "Deve contenere almeno una lettera maiuscola" })
      .regex(/[0-9]/, { message: "Deve contenere almeno un numero" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Conferma la password" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
