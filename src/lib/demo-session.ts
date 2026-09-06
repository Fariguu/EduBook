import { cookies } from "next/headers";
import { createAdminClient } from "@/utils/supabase/server";

export const DEMO_SESSION_COOKIE = "edubook_demo_session";
export const DEMO_AUTH_COOKIE = "edubook_demo_auth";

/**
 * Recupera l identificativo di sessione sandbox per il visitatore corrente.
 * Se non esiste, ne genera uno nuovo (UUID v4), lo salva nei cookie HTTP
 * e popola automaticamente il set di dati di prova iniziale per il Prof. Mario Rossi.
 */
export async function getDemoSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(DEMO_SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    try {
      cookieStore.set(DEMO_SESSION_COOKIE, sessionId, {
        path: "/",
        sameSite: "lax",
        httpOnly: true,
      });
    } catch {
      // In Server Components di sola lettura i cookie non possono essere modificati direttamente
    }

    try {
      const admin = createAdminClient();
      await admin.rpc("seed_demo_session", { p_session_id: sessionId });
    } catch (err) {
      console.error("[getDemoSessionId] Errore seed iniziale:", err);
    }
  }

  return sessionId;
}

/**
 * Elimina i cookie di sessione e autenticazione demo.
 */
export async function clearDemoCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_SESSION_COOKIE);
  cookieStore.delete(DEMO_AUTH_COOKIE);
}

/**
 * Ripristina istantaneamente tutti i dati della sandbox demo per la sessione corrente
 * reinvocando la procedura di seed sul database.
 */
export async function resetDemoSession(): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionId = await getDemoSessionId();
    const admin = createAdminClient();
    const { error } = await admin.rpc("seed_demo_session", { p_session_id: sessionId });
    if (error) throw error;
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore durante il reset della demo";
    console.error("[resetDemoSession] Errore:", msg);
    return { success: false, error: msg };
  }
}
