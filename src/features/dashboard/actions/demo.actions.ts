"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetDemoSession, DEMO_AUTH_COOKIE, DEMO_SESSION_COOKIE } from "@/lib/demo-session";

export async function resetDemoSessionAction() {
  const result = await resetDemoSession();
  if (result.success) {
    revalidatePath("/", "layout");
  }
  return result;
}

export async function loginDemoAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_AUTH_COOKIE, "true", {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore durante l'accesso demo";
    return { success: false, error: msg };
  }
}

export async function logoutDemoAction() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_AUTH_COOKIE);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function exitDemoToPortfolioAction(): Promise<{ redirectUrl: string }> {
  try {
    await resetDemoSession();
  } catch {
    // Ignora eventuali errori per consentire il reindirizzamento
  }
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_AUTH_COOKIE);
  cookieStore.delete(DEMO_SESSION_COOKIE);
  revalidatePath("/", "layout");
  return { redirectUrl: "https://gabrielefarigu.com" };
}
