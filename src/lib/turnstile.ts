/**
 * Helper per la verifica server-side dei token Cloudflare Turnstile.
 */
export async function verifyTurnstileToken(token?: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // Se siamo con le chiavi di test Cloudflare o la chiave non è impostata, considera valido (ambiente dev/preview)
  if (!secretKey || secretKey.startsWith("1x00000000000000000000")) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });

    const outcome = await res.json();
    return Boolean(outcome.success);
  } catch (error) {
    console.error("[Turnstile] Errore durante la verifica del token:", error);
    // In dev non blocchiamo per errori di rete
    return process.env.NODE_ENV === "development";
  }
}
