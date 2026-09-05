import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheckIcon, MailIcon, ClockIcon, LockIcon, DatabaseIcon, AlertCircleIcon } from "lucide-react";
import Link from "next/link";

interface PrivacyContentProps {
  professorName: string;
  professorEmail: string;
}

export function PrivacyContent({
  professorName = "Prof. Gabriele Farigu",
  professorEmail = "info@edubook.it",
}: PrivacyContentProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Informativa */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
          <ShieldCheckIcon className="w-4 h-4" />
          Conformità GDPR (Regolamento UE 2016/679)
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
          Informativa sulla Privacy
        </h1>
        <p className="text-muted-foreground text-sm">
          Ultimo aggiornamento: Settembre 2026
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6 sm:p-8 space-y-6 text-sm text-text leading-relaxed">
          {/* Sezione 1 */}
          <section className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-primary" />
              1. Titolare del Trattamento dei Dati
            </h2>
            <p className="text-muted-foreground">
              Il Titolare del trattamento dei dati personali raccolti attraverso questo sito web è{" "}
              <strong>{professorName}</strong>, contattabile per qualsiasi chiarimento in merito alla privacy e
              all&apos;esercizio dei propri diritti all&apos;indirizzo email:{" "}
              <a href={`mailto:${professorEmail}`} className="text-primary font-medium underline">
                {professorEmail}
              </a>.
            </p>
          </section>

          {/* Sezione 2 */}
          <section className="space-y-2 border-t border-border pt-5">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5 text-primary" />
              2. Tipologie di Dati Raccolti
            </h2>
            <p className="text-muted-foreground">
              Il sito raccoglie esclusivamente i dati strettamente necessari per l&apos;erogazione del servizio di
              prenotazione lezioni e per la corrispondenza con gli utenti:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2">
              <li>
                <strong>Dati per la prenotazione lezioni (Guest):</strong> Nome, Cognome, indirizzo email e
                eventuali note didattiche inserite volontariamente al momento della prenotazione.
              </li>
              <li>
                <strong>Dati del modulo contatti:</strong> Nome, Cognome, indirizzo email e corpo del messaggio inviato.
              </li>
              <li>
                <strong>Dati tecnici e di sicurezza:</strong> Token di verifica anti-spam forniti dal servizio
                Cloudflare Turnstile (al fine di prevenire attacchi automatici e bot).
              </li>
              <li>
                <strong>Cookie e preferenze:</strong> Cookie tecnici di sessione strettamente necessari al
                funzionamento della piattaforma e preferenza del tema visivo (Dark / Light mode).
              </li>
            </ul>
          </section>

          {/* Sezione 3 */}
          <section className="space-y-2 border-t border-border pt-5">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <LockIcon className="w-5 h-5 text-primary" />
              3. Finalità e Base Giuridica del Trattamento
            </h2>
            <p className="text-muted-foreground">
              I dati forniti vengono trattati per le seguenti finalità:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground pl-2">
              <li>
                <strong>Gestione delle prenotazioni delle lezioni (Art. 6.1.b GDPR):</strong> Necessario per la
                conferma, la gestione, l&apos;eventuale spostamento e lo svolgimento delle lezioni private richieste
                dall&apos;utente.
              </li>
              <li>
                <strong>Risposta a richieste di informazioni (Art. 6.1.b GDPR):</strong> Necessario per rispondere
                alle comunicazioni inviate tramite il modulo di contatto o via email.
              </li>
              <li>
                <strong>Sicurezza e prevenzione abusi (Art. 6.1.f GDPR):</strong> Legittimo interesse del titolare a
                garantire la sicurezza dell&apos;infrastruttura web contro spam, accessi non autorizzati e attacchi informatici.
              </li>
            </ol>
          </section>

          {/* Sezione 4 */}
          <section className="space-y-2 border-t border-border pt-5">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-primary" />
              4. Conservazione dei Dati e Cancellazione Automatica
            </h2>
            <p className="text-muted-foreground">
              Adottiamo il principio di minimizzazione della conservazione:
            </p>
            <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs sm:text-sm space-y-1">
              <p className="font-semibold text-text flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4 text-primary" />
                Politica di conservazione a 365 giorni (Cron Cleanup)
              </p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Tutte le lezioni passate o concluse e i relativi dati dello studente guest vengono conservati per un
                periodo massimo di <strong>365 giorni</strong> dalla data di svolgimento, al termine del quale vengono
                definitivamente rimossi dal database tramite una procedura automatizzata notturna.
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              I messaggi del form di contatto vengono conservati per il tempo strettamente indispensabile all&apos;evasione
              della richiesta e possono essere eliminati in qualsiasi momento dal docente.
            </p>
          </section>

          {/* Sezione 5 */}
          <section className="space-y-2 border-t border-border pt-5">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 text-primary" />
              5. Diritti dell&apos;Interessato (Artt. 15-22 GDPR)
            </h2>
            <p className="text-muted-foreground">
              In qualsiasi momento, l&apos;interessato ha il diritto di:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-2 text-xs sm:text-sm">
              <li>Ottenere la conferma dell&apos;esistenza o meno di dati personali che lo riguardano;</li>
              <li>Chiedere l&apos;accesso ai dati, la rettifica, l&apos;aggiornamento o la cancellazione degli stessi (diritto all&apos;oblio);</li>
              <li>Chiedere la limitazione del trattamento o opporsi al loro trattamento;</li>
              <li>Richiedere la portabilità dei dati in un formato strutturato e leggibile;</li>
              <li>
                Proporre reclamo all&apos;Autorità di Controllo competente (Garante per la Protezione dei Dati Personali —{" "}
                <a
                  href="https://www.garanteprivacy.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  www.garanteprivacy.it
                </a>).
              </li>
            </ul>
          </section>

          {/* Sezione 6 */}
          <section className="space-y-2 border-t border-border pt-5">
            <h2 className="text-base sm:text-lg font-bold text-text flex items-center gap-2">
              <MailIcon className="w-5 h-5 text-primary" />
              6. Come Esercitare i Propri Diritti
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Per esercitare i propri diritti, richiedere la rimozione immediata dei propri dati di prenotazione o per
              qualsiasi informazione, è possibile inviare una richiesta all&apos;indirizzo email:{" "}
              <a href={`mailto:${professorEmail}`} className="text-primary font-semibold underline">
                {professorEmail}
              </a>{" "}
              o compilare il{" "}
              <Link href="/contatti" className="text-primary font-semibold underline">
                modulo di contatto del sito
              </Link>. Risponderemo entro i termini di legge (massimo 30 giorni).
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
