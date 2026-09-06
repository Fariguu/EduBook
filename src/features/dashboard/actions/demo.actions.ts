"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resetDemoSession, DEMO_AUTH_COOKIE } from "@/lib/demo-session";

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
      maxAge: 60 * 60 * 24 * 7,
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
