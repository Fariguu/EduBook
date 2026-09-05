/**
 * Template HTML per le email transazionali del sistema EduBook.
 */

interface BaseEmailWrapperProps {
  title: string;
  preheader?: string;
  contentHtml: string;
}

function wrapEmail({ title, preheader = "", contentHtml }: BaseEmailWrapperProps): string {
  return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7faf5;
      color: #02270a;
      margin: 0;
      padding: 24px;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #e0ebd8;
    }
    .header {
      background: #238626;
      color: #ffffff;
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 32px;
    }
    .card {
      background: #f4f8f1;
      border: 1px solid #d4e6c9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .card-item {
      margin: 8px 0;
      font-size: 15px;
    }
    .card-label {
      font-weight: 600;
      color: #238626;
      display: inline-block;
      min-width: 110px;
    }
    .btn {
      display: inline-block;
      background-color: #238626;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 15px;
      margin: 16px 0;
      text-align: center;
    }
    .footer {
      background: #f4f8f1;
      border-top: 1px solid #e0ebd8;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #687c50;
    }
    .note {
      font-size: 13px;
      color: #555555;
      font-style: italic;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1>EduBook</h1>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>Questa è una notifica automatica generata da EduBook.</p>
      <p>© ${new Date().getFullYear()} EduBook - Prenotazione Lezioni Private</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Email di conferma richiesta prenotazione inviata allo studente guest.
 */
export function bookingConfirmationEmail({
  guestName,
  formattedDate,
  formattedStartTime,
  formattedEndTime,
  manageUrl,
}: {
  guestName: string;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
  manageUrl: string;
}): string {
  const content = `
    <h2>Richiesta di Prenotazione Ricevuta</h2>
    <p>Ciao <strong>${guestName}</strong>,</p>
    <p>Abbiamo ricevuto la tua richiesta di prenotazione per una lezione privata. Il professore esaminerà la tua richiesta al più presto.</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">📅 Data:</span> ${formattedDate}</div>
      <div class="card-item"><span class="card-label">⏰ Orario:</span> ${formattedStartTime} - ${formattedEndTime}</div>
      <div class="card-item"><span class="card-label">📌 Stato:</span> In attesa di conferma</div>
    </div>

    <p>Puoi consultare lo stato della tua prenotazione o richiedere una modifica in qualsiasi momento cliccando sul pulsante sottostante:</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${manageUrl}" class="btn" target="_blank">Gestisci la tua Prenotazione</a>
    </div>

    <p class="note">Conserva questa email: il link sopra contiene il tuo codice univoco per gestire o spostare la lezione in caso di imprevisti.</p>
  `;

  return wrapEmail({
    title: "Conferma Richiesta Prenotazione - EduBook",
    preheader: `Richiesta di lezione per il ${formattedDate} dalle ${formattedStartTime} alle ${formattedEndTime}`,
    contentHtml: content,
  });
}

/**
 * 2. Email di notifica richiesta spostamento inviata al professore.
 */
export function rescheduleRequestEmail({
  guestName,
  guestEmail,
  formattedDate,
  formattedTime,
  reason,
  lessonId,
}: {
  guestName: string;
  guestEmail: string;
  formattedDate: string;
  formattedTime: string;
  reason: string;
  lessonId: string;
}): string {
  const content = `
    <h2>⚠️ Richiesta Spostamento Lezione</h2>
    <p>Lo studente <strong>${guestName}</strong> (<a href="mailto:${guestEmail}">${guestEmail}</a>) ha richiesto di spostare la seguente lezione:</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">📅 Data attuale:</span> ${formattedDate}</div>
      <div class="card-item"><span class="card-label">⏰ Orario:</span> ${formattedTime}</div>
      <div class="card-item"><span class="card-label">🆔 ID Lezione:</span> <code>${lessonId}</code></div>
      <div class="card-item" style="margin-top:12px;"><span class="card-label">💬 Motivazione:</span><br>
        <blockquote style="margin:8px 0;padding:10px 14px;background:#ffffff;border-left:3px solid #238626;font-style:italic;">
          "${reason}"
        </blockquote>
      </div>
    </div>

    <p>Accedi alla tua <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard">Dashboard</a> per aggiornare l'orario o ricontattare lo studente.</p>
  `;

  return wrapEmail({
    title: `Richiesta Spostamento Lezione - ${guestName}`,
    preheader: `${guestName} richiede di spostare la lezione del ${formattedDate}`,
    contentHtml: content,
  });
}

/**
 * 3. Email di notifica messaggio dal modulo di contatto.
 */
export function contactReceivedEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}): string {
  const content = `
    <h2>Nuovo Messaggio dal Sito</h2>
    <p>Hai ricevuto un nuovo messaggio tramite il modulo di contatto di EduBook:</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">👤 Mittente:</span> <strong>${name}</strong></div>
      <div class="card-item"><span class="card-label">✉️ Email:</span> <a href="mailto:${email}">${email}</a></div>
      <div class="card-item" style="margin-top:12px;"><span class="card-label">📝 Messaggio:</span><br>
        <div style="margin-top:8px;padding:12px;background:#ffffff;border-radius:6px;border:1px solid #e0ebd8;white-space:pre-wrap;">
${message}
        </div>
      </div>
    </div>

    <p>Puoi rispondere direttamente rispondendo a questa email oppure scrivendo a <a href="mailto:${email}">${email}</a>.</p>
  `;

  return wrapEmail({
    title: `Nuovo Messaggio da ${name} - EduBook`,
    preheader: `Messaggio da ${name} (${email}): ${message.slice(0, 80)}...`,
    contentHtml: content,
  });
}

/**
 * 4. Email di conferma lezione inviata allo studente.
 */
export function lessonConfirmedStudentEmail({
  guestName,
  formattedDate,
  formattedStartTime,
  formattedEndTime,
  googleCalendarUrl,
  manageUrl,
}: {
  guestName: string;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
  googleCalendarUrl: string;
  manageUrl: string;
}): string {
  const content = `
    <h2>🎉 La tua lezione è confermata!</h2>
    <p>Ciao <strong>${guestName}</strong>,</p>
    <p>Il docente ha confermato la tua richiesta di lezione per il seguente appuntamento:</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">📅 Data:</span> ${formattedDate}</div>
      <div class="card-item"><span class="card-label">⏰ Orario:</span> ${formattedStartTime} - ${formattedEndTime}</div>
      <div class="card-item"><span class="card-label">📌 Stato:</span> <strong style="color:#238626;">Confermata</strong></div>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${googleCalendarUrl}" class="btn" target="_blank" style="margin-right: 8px;">Aggiungi a Google Calendar</a>
      <a href="${manageUrl}" class="btn" target="_blank" style="background-color: #687c50;">Gestisci Prenotazione</a>
    </div>

    <p class="note">In caso di contrattempi, puoi utilizzare il link di gestione per richiedere una modifica di orario.</p>
  `;

  return wrapEmail({
    title: "Lezione Confermata! - EduBook",
    preheader: `La tua lezione del ${formattedDate} dalle ${formattedStartTime} alle ${formattedEndTime} è stata confermata`,
    contentHtml: content,
  });
}

/**
 * 5. Email di rifiuto/annullamento prenotazione inviata allo studente.
 */
export function lessonRejectedStudentEmail({
  guestName,
  formattedDate,
  formattedStartTime,
  formattedEndTime,
  reason,
}: {
  guestName: string;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
  reason?: string | null;
}): string {
  const reasonHtml = reason
    ? `<div class="card-item" style="margin-top:12px;"><span class="card-label">💬 Messaggio del docente:</span><br>
        <blockquote style="margin:8px 0;padding:10px 14px;background:#ffffff;border-left:3px solid #687c50;font-style:italic;">
          "${reason}"
        </blockquote>
      </div>`
    : "";

  const content = `
    <h2>Aggiornamento Richiesta Lezione</h2>
    <p>Ciao <strong>${guestName}</strong>,</p>
    <p>Purtroppo il docente non ha potuto confermare la tua richiesta per la seguente lezione:</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">📅 Data richiesta:</span> ${formattedDate}</div>
      <div class="card-item"><span class="card-label">⏰ Orario:</span> ${formattedStartTime} - ${formattedEndTime}</div>
      ${reasonHtml}
    </div>

    <p>Ti invitiamo a consultare il calendario per verificare altre date o orari disponibili:</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/prenota" class="btn">Visualizza Altre Disponibilità</a>
    </div>
  `;

  return wrapEmail({
    title: "Aggiornamento sulla tua richiesta di lezione - EduBook",
    preheader: `Non è stato possibile confermare la lezione per il ${formattedDate}`,
    contentHtml: content,
  });
}

/**
 * 6. Email di notifica modifica orario inviata allo studente.
 */
export function lessonTimeUpdatedStudentEmail({
  guestName,
  formattedDate,
  formattedStartTime,
  formattedEndTime,
  googleCalendarUrl,
  manageUrl,
}: {
  guestName: string;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
  googleCalendarUrl: string;
  manageUrl: string;
}): string {
  const content = `
    <h2>Aggiornamento Orario Lezione</h2>
    <p>Ciao <strong>${guestName}</strong>,</p>
    <p>L'orario della tua lezione è stato aggiornato dal docente con i seguenti nuovi riferimenti:</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">📅 Nuova Data:</span> ${formattedDate}</div>
      <div class="card-item"><span class="card-label">⏰ Nuovo Orario:</span> ${formattedStartTime} - ${formattedEndTime}</div>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${googleCalendarUrl}" class="btn" target="_blank" style="margin-right: 8px;">Aggiorna su Google Calendar</a>
      <a href="${manageUrl}" class="btn" target="_blank" style="background-color: #687c50;">Visualizza Dettagli</a>
    </div>
  `;

  return wrapEmail({
    title: "Orario Lezione Modificato - EduBook",
    preheader: `Il nuovo orario per la lezione è il ${formattedDate} dalle ${formattedStartTime} alle ${formattedEndTime}`,
    contentHtml: content,
  });
}

/**
 * 7. Email di cancellazione lezione confermata inviata allo studente.
 */
export function lessonCancelledStudentEmail({
  guestName,
  formattedDate,
  formattedStartTime,
  formattedEndTime,
}: {
  guestName: string;
  formattedDate: string;
  formattedStartTime: string;
  formattedEndTime: string;
}): string {
  const content = `
    <h2>Lezione Annullata</h2>
    <p>Ciao <strong>${guestName}</strong>,</p>
    <p>Ti informiamo che la seguente lezione precedentemente programmata è stata annullata:</p>
    
    <div class="card">
      <div class="card-item"><span class="card-label">📅 Data:</span> ${formattedDate}</div>
      <div class="card-item"><span class="card-label">⏰ Orario:</span> ${formattedStartTime} - ${formattedEndTime}</div>
    </div>

    <p>Ci scusiamo per il disagio. Puoi prenotare un nuovo appuntamento in qualunque momento:</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/prenota" class="btn">Prenota Nuova Lezione</a>
    </div>
  `;

  return wrapEmail({
    title: "Lezione Annullata - EduBook",
    preheader: `La lezione del ${formattedDate} è stata annullata`,
    contentHtml: content,
  });
}
