# EduBook - Piattaforma di Gestione e Prenotazione Lezioni Private

<div align="center">

![Next.js 15](https://img.shields.io/badge/Next.js-15.5.20-black?style=for-the-badge&logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SonarCloud Quality](https://img.shields.io/badge/SonarCloud-Rating%20A-brightgreen?style=for-the-badge&logo=sonarcloud&logoColor=white)

**EduBook** e una piattaforma web full-stack professionale progettata per **docenti singoli e liberi professionisti** dell insegnamento privato (matematica, fisica, scienze e materie accademiche).
Consente agli studenti di prenotare autonomamente lezioni individuali senza obbligo di registrazione, mentre offre al docente una dashboard unificata per la gestione del calendario, l approvazione delle richieste e la personalizzazione visiva della landing page.

[Caratteristiche](#caratteristiche-principali) |
[Architettura](#architettura-del-progetto) |
[Stack Tecnologico](#stack-tecnologico) |
[Installazione e Setup](#installazione-e-setup-locale) |
[Documentazione Tecnica](#documentazione-tecnica-per-sviluppatori)

</div>

---

## Obiettivi e Valore di Business

Nei tradizionali sistemi di prenotazione, gli studenti sono costretti a creare un account con password prima ancora di sapere se la lezione sara confermata, generando attrito e abbandono.

EduBook risolve radicalmente questo problema con un modello **Single-Professor e Guest Booking**:
1. **Zero attrito per lo studente**: prenotazione diretta in meno di 2 minuti inserendo solo nome, email e argomento.
2. **Link di gestione univoco**: lo studente riceve un email con un link protetto da UUID casuale (`/gestisci/[id]`) per verificare lo stato della lezione o richiederne lo spostamento.
3. **Pieno controllo del docente**: il docente riceve le notifiche, gestisce gli slot orari con ripetizione settimanale, approva o rifiuta le richieste con motivazione e personalizza in tempo reale ogni sezione del proprio sito web.

---

## Caratteristiche Principali

### Per gli Studenti (Esperienza Guest)
- **Calendario Interattivo**: visualizzazione chiara e reattiva degli slot disponibili giorno per giorno.
- **Supporto Mega-Slot**: possibilita di selezionare finestre orarie flessibili (es. 1 ora all interno di un blocco da 3 ore); il sistema suddivide automaticamente lo slot restante rendendolo disponibile per altri studenti.
- **Protezione Anti-Bot Cloudflare Turnstile**: verifica invisibile e rapida contro spam e bot maligni.
- **Link Google Calendar Automatico**: aggiunta immediata della lezione confermata al proprio calendario Google con un solo clic.
- **Modulo di Contatto Diretto**: pagina `/contatti` per richiedere informazioni prima della prenotazione.

### Per il Docente (Dashboard Protetta)
- **Panoramica a 4 Sezioni di Layout**:
  - **In Attesa**: visualizzazione richieste pendenti con note espandibili (*"continua a leggere"*), azioni rapide con etichette esplicite (*Conferma*, *Rifiuta*, *Modifica Orario*).
  - **Confermate**: gestione lezioni approvate con possibilita di riprogrammazione oraria o cancellazione con scelta di ripristino o eliminazione slot.
  - **Disponibilita**: slot manager completo con creazione slot singoli o serie ricorrenti settimanali (fino a 12 settimane) ed eliminazione rapida.
  - **Messaggi**: archivio ordinato dei messaggi ricevuti dal modulo contatti.
- **Notifiche Email Transazionali con Resend**: invio automatico di email formattate e responsive ad ogni cambio di stato (conferma, rifiuto con motivazione, modifica orario, cancellazione).
- **Personalizzazione Completa del Sito (`/dashboard/profilo`)**:
  - **Dati Docente**: anagrafica, headline, bio, recapiti e materie insegnate con dettagli.
  - **Gestione Percorso**: personalizzazione dinamica del titolo, sottotitolo e schede dei punti di forza didattici (da 1 a 6 voci con icone selezionabili).
  - **Card Informativa Hero**: personalizzazione delle righe informative in primo piano e della nota a pie di pagina.
  - **Sicurezza Account**: cambio rapido di email e password.

---

## Architettura del Progetto

Il progetto segue rigorosamente la **Vertical Slice Architecture (VSA)**, raggruppando il codice per aree di funzionalita (feature) anziche per strati tecnici orizzontali.

```
src/
|-- app/                              # Next.js 15 App Router
|   |-- (public)/                     # Rotte pubbliche (/, /prenota, /gestisci/[id], /contatti)
|   |-- dashboard/                    # Rotte protette docente (/dashboard, /dashboard/profilo)
|   `-- api/cron/cleanup/             # Endpoint cron manutenzione slot passati
|-- features/                         # Feature Slices (VSA)
|   |-- auth/                         # Autenticazione professore (Server Actions, Schemi, Modal)
|   |-- booking/                      # Prenotazione guest, Mega-Slot e gestione studente
|   |-- contact/                      # Form di contatto pubblico e messaggi docente
|   |-- dashboard/                    # Pannello docente, slot manager, lezioni
|   |-- landing/                      # Landing page istituzionale, hero, bio, footer
|   `-- profile/                      # Gestione profilo, Gestione Percorso, Hero Card
|-- components/ui/                    # Design System atomico (shadcn/ui + Radix UI)
|-- lib/                              # Integrazioni terze parti (Resend, Turnstile, Email Templates)
`-- utils/supabase/                   # Client Supabase SSR (client, server, middleware)
```

Per i dettagli approfonditi sull architettura interna, consulta la [Documentazione Tecnica per Sviluppatori](docs/TECHNICAL_DOCS.md).

---

## Stack Tecnologico

| Area | Tecnologia / Libreria | Scopo |
|---|---|---|
| **Framework Full-Stack** | Next.js 15 (App Router, Turbopack) | Server-Side Rendering, Server Actions, routing e ottimizzazione bundle |
| **Linguaggio** | TypeScript 5 (Strict Mode) | Tipizzazione statica completa e sicurezza a tempo di compilazione |
| **Libreria UI** | React 19 | Componenti reattivi, hook e gestione concorrente dello stato |
| **Database e Auth** | Supabase (PostgreSQL 15 + Supabase Auth) | Database relazionale ACID, procedure stored RPC, autenticazione con cookie SSR |
| **Styling e Design System** | Tailwind CSS v4 + Radix UI + Lucide Icons | Stili atomici responsive, accessibilita WAI-ARIA, supporto Dark/Light mode |
| **Validazione Dati** | Zod | Validazione runtime per form, Server Actions e configurazioni JSONB |
| **Anti-Spam e Sicurezza** | Cloudflare Turnstile | Protezione invisibile contro abusi e bot sui form pubblici |
| **Email Transazionali** | Resend | Invio email HTML responsive per conferme, rifiuti e notifiche |
| **Animazioni** | Framer Motion | Animazioni fluide per modali, dialog e transizioni |
| **Date e Calendario** | date-fns (locale italiano) | Manipolazione, calcolo intervalli e formattazione orari |

---

## Installazione e Setup Locale

### 1. Prerequisiti
- **Node.js**: versione `18.18.0` o superiore (`node -v`).
- **npm** (incluso in Node.js) o gestori alternativi (`pnpm`, `bun`).
- Un account attivo su **[Supabase](https://supabase.com)**, **[Resend](https://resend.com)** e **[Cloudflare Turnstile](https://dash.cloudflare.com/)**.

### 2. Clonazione del Repository
```bash
git clone https://github.com/Fariguu/EduBook.git
cd EduBook
```

### 3. Installazione Dipendenze
```bash
npm install
```

### 4. Configurazione Variabili d Ambiente
Duplica il file di esempio `.env.example` in `.env.local`:
```bash
cp .env.example .env.local
```

Compila le variabili all interno di `.env.local`:
```env
# Supabase Backend
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Cloudflare Turnstile (Le chiavi di test sotto passano sempre in locale)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA

# Resend Email
RESEND_API_KEY=re_your_api_key_here

# App URL e Cron
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CRON_SECRET=your-random-secret
```

### 5. Configurazione Database Supabase
Apri l **SQL Editor** del tuo progetto Supabase ed esegui:
1. Gli script di migrazione contenuti nella cartella `scripts/`:
   - [`scripts/add_why_choose_us_column.sql`](scripts/add_why_choose_us_column.sql): aggiunge le colonne `why_choose_us` e `hero_card` alla tabella `profiles`.
2. Assicurati che siano presenti le tabelle `profiles`, `lessons`, `contacts` e la funzione RPC `split_and_book_slot` (vedere la [Guida Tecnica](docs/TECHNICAL_DOCS.md#2-modello-del-database-supabase-postgresql)).

### 6. Avvio del Server di Sviluppo
```bash
npm run dev
```
L applicazione sara disponibile su [http://localhost:3000](http://localhost:3000).

---

## Script NPM Disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia il server di sviluppo Next.js con Turbopack |
| `npm run build` | Compila l applicazione per la produzione con typechecking rigoroso |
| `npm run start` | Avvia il server di produzione |
| `npm run lint` | Esegue ESLint verificando conformita del codice e assenza di smell |

---

## Documentazione Tecnica per Sviluppatori

Per comprendere nel dettaglio l implementazione interna, i parametri di ogni Server Action, lo schema del database Postgres, le politiche di sicurezza RLS e le linee guida di estensione, consulta:

- **[Leggi la Documentazione Tecnica Dettagliata (`docs/TECHNICAL_DOCS.md`)](docs/TECHNICAL_DOCS.md)**

---

## Autore e Crediti

Sviluppato da **Gabriele Farigu**.
- **Portfolio e Contatti**: [gabrielefarigu.com](https://gabrielefarigu.com/)
- **GitHub**: [@Fariguu](https://github.com/Fariguu)

---

## Licenza

Questo progetto e rilasciato sotto licenza privata/proprietaria. Tutti i diritti sono riservati.
