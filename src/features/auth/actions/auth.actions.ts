"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import {
  loginSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  type LoginInput,
  type ResetPasswordInput,
  type UpdatePasswordInput,
} from "../schemas/auth.schema";

export async function loginWithPassword(input: LoginInput) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Dati di accesso non validi" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Credenziali non valide o utente non trovato" };
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const allowedRoles = ["admin", "professor", "superadmin"];
  if (!profile || !allowedRoles.includes(profile.role)) {
    await supabase.auth.signOut();
    return { error: "Accesso non autorizzato. Solo il professore può accedere." };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPasswordAction(input: ResetPasswordInput) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Email non valida" };
  }

  const headersList = await headers();
  const origin = headersList.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { error: "Impossibile inviare l'email di ripristino. Riprova più tardi." };
  }

  return { success: true, message: "Email di ripristino inviata con successo. Controlla la tua casella di posta." };
}

export async function updatePasswordAction(input: UpdatePasswordInput) {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Password non valida" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    return { error: "Impossibile aggiornare la password: " + error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
