import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Invia un'email transazionale via Resend con fallback in caso di mancata configurazione o restrizioni del free tier.
 */
export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const sender = from || process.env.RESEND_FROM_EMAIL || "EduBook <onboarding@resend.dev>";

  // Fallback: se Resend non è configurato o siamo in mock
  if (!resend || !resendApiKey) {
    console.log("📨 [MOCK EMAIL CONSOLE]", {
      to,
      from: sender,
      subject,
      replyTo,
      timestamp: new Date().toISOString(),
    });
    return { success: true, id: "mock-email-" + Date.now() };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.warn("⚠️ [Resend Notification]", error.message);
      // Non blocchiamo l'operazione utente (es. prenotazione completata con successo) se l'email fallisce sul free tier
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Errore sconosciuto nell'invio email";
    console.error("❌ [Resend Error]", message);
    return { success: false, error: message };
  }
}
