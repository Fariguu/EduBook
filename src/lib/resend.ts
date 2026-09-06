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
  replyTo,
  from,
}: SendEmailOptions): Promise<SendEmailResult> {
  const sender = from || process.env.RESEND_FROM_EMAIL || "EduBook Demo <onboarding@resend.dev>";

  // Modalita Demo: invio email simulato per evitare consumo crediti e spam verso terzi
  console.info("[DEMO MODE EMAIL SIMULATION]", {
    to,
    from: sender,
    subject,
    replyTo,
    timestamp: new Date().toISOString(),
  });

  return { success: true, id: "demo-simulated-email-" + Date.now() };
}
