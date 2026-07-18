# 📋 Documentazione Completa — EduBook

> **Scopo di questo documento**: fornire a un'AI generativa tutto il contesto necessario per ricostruire il progetto da zero, step-by-step. Include: funzionalità, stack tecnologico, architettura DB, routing, logica server-side, componenti UI, flussi di autenticazione, email, sicurezza e variabili d'ambiente.

---

## 1. Visione del Progetto

**EduBook** è una **Web App serverless single-professor** per la gestione di lezioni private. Il sito è di proprietà di un singolo professore che gestisce il proprio calendario e riceve prenotazioni dagli studenti.

### Attori del sistema

| Ruolo | Descrizione |
|---|---|
| **Visitatore anonimo** | Può vedere la homepage del professore, consultare le disponibilità, prenotare come guest (nome + email) e inviare messaggi tramite il form contatto. |
| **Studente (guest)** | Un visitatore che ha effettuato una prenotazione. Gestisce la propria prenotazione tramite un link privato ricevuto via email (`/gestisci/[id]`). Non ha un account. |
| **Professore** | L'unico utente autenticato. Gestisce il proprio calendario, conferma/rifiuta prenotazioni, modifica il proprio profilo, visualizza messaggi di contatto e statistiche. Account creato manualmente con email + password predefinita, password modificabile al primo accesso. |

### Principi architetturali

- **100% serverless** — Nessun server dedicato. Hosting su Vercel (free tier), DB su Supabase (free tier).
- **Single-Professor** — Tutta la piattaforma ruota attorno a un unico professore. Nessun multi-tenant, nessuna ricerca, nessuna candidatura.
- **Prenotazione senza registrazione** — Gli studenti prenotano come guest fornendo solo nome + email. Gestiscono via link privato.
- **Vertical Slice Architecture (VSA)** — Ogni feature è autocontenuta in `src/features/<feature>/`. Le pagine in `app/` sono thin wrapper.
- **Privacy by Design** — GDPR compliance integrata: consenso esplicito, RLS, data minimization.
- **Cost Zero** — Tutto è costruito su free tier: Supabase, Vercel, Resend, Cloudflare Turnstile.

### Versioning del prodotto

- **V1 (Sprint 1–4)**: Scenario A — Solo guest. Prenotazione con nome+email, nessuna registrazione studente, nessuna recensione.
- **V2 (Sprint futuri)**: Scenario B — Registrazione studente opzionale + dashboard studente + sistema recensioni.

---

## 2. Architettura — Vertical Slice Architecture (VSA)

### 2.1 Principi VSA

1. **Ogni feature è indipendente** — modificare booking non tocca mai auth o dashboard.
2. **Le pagine `app/` sono thin wrappers** — importano componenti/actions dal feature corrispondente.
3. **Nessun file "shared" di business logic** — solo `components/ui/` (design system) e `utils/supabase/` (infrastruttura) sono condivisi.
4. **Test per slice** — ogni feature può essere testata in isolamento.
5. **Nuove feature = nuova cartella** — non si modificano file esistenti.

### 2.2 Struttura Cartelle

```
src/
├── app/                          # Solo routing + thin page wrappers
│   ├── globals.css               # Design system Tailwind + shadcn
│   ├── layout.tsx                # Root layout (font, toaster, analytics)
│   ├── page.tsx                  # Homepage → importa da features/landing
│   ├── not-found.tsx             # 404 custom
│   ├── prenota/page.tsx          # → importa da features/booking
│   ├── contatti/page.tsx         # → importa da features/contact
│   ├── privacy/page.tsx          # → importa da features/legal
│   ├── gestisci/[id]/page.tsx    # → importa da features/booking
│   ├── update-password/page.tsx  # → importa da features/auth
│   ├── auth/callback/route.ts    # Auth callback
│   ├── api/cron/
│   │   └── cleanup/route.ts     # Cron pulizia lezioni vecchie
│   └── dashboard/
│       ├── layout.tsx            # Dashboard layout (protetto, solo prof)
│       ├── page.tsx              # → importa da features/dashboard
│       └── profilo/page.tsx      # → importa da features/profile
│
├── features/                     # 🎯 Vertical Slices — cuore dell'app
│   ├── auth/                     # Autenticazione (solo professore)
│   │   ├── actions/              # login, logout, resetPassword, updatePassword
│   │   ├── components/           # AuthModal, UpdatePasswordForm, LogoutButton
│   │   ├── schemas/              # AuthSchema (Zod)
│   │   └── utils/                # requireAuth(), session helpers
│   │
│   ├── booking/                  # Prenotazioni (guest)
│   │   ├── actions/              # bookLesson, requestReschedule
│   │   ├── components/           # BookingCalendar, RescheduleForm, ManageBooking
│   │   ├── schemas/              # BookingSchema (Zod)
│   │   └── types/                # Tipi specifici booking
│   │
│   ├── dashboard/                # Dashboard professore
│   │   ├── actions/              # createSlot, removeSlot, confirmLesson, rejectLesson, updateLessonTime, cancelLesson
│   │   ├── components/           # DashboardView, SlotManager, LessonTabs, CreateSlotDialog, EditLessonDialog
│   │   └── types/                # Tipi dashboard
│   │
│   ├── contact/                  # Form contatto
│   │   ├── actions/              # sendContactMessage, getContactMessages
│   │   ├── components/           # ContactForm, ContactMessagesList
│   │   └── schemas/              # ContactSchema (Zod)
│   │
│   ├── landing/                  # Homepage / profilo pubblico
│   │   └── components/           # HeroSection, BioSection, SubjectBadges, CTASection
│   │
│   ├── profile/                  # Profilo professore (edit)
│   │   ├── actions/              # updateProfile
│   │   ├── components/           # ProfileForm
│   │   └── schemas/              # ProfileSchema (Zod)
│   │
│   └── legal/                    # Privacy policy
│       └── components/           # PrivacyContent
│
├── components/
│   └── ui/                       # shadcn/ui (componenti condivisi, non feature-specific)
│
├── lib/
│   └── utils.ts                  # cn() = clsx + tailwind-merge
│
└── utils/
    └── supabase/
        ├── client.ts             # createBrowserClient (client-side)
        ├── server.ts             # createClient + createAdminClient (server-side)
        └── middleware.ts         # updateSession + redirect logic
```

---

## 3. Stack Tecnologico

### 3.1 Core Framework & Runtime

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **Next.js** | `15.5.20` | Framework full-stack con App Router, Server Components, Server Actions |
| **React** | `19.1.0` | Libreria UI |
| **TypeScript** | `^5` | Linguaggio (strict mode abilitato) |
| **Node.js** | (runtime Vercel) | Esecuzione server-side |

### 3.2 Styling & UI

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **Tailwind CSS** | `v4` | Utility-first CSS framework (con `@tailwindcss/postcss`) |
| **tailwindcss-animate** | `^1.0.7` | Animazioni CSS predefinite per Tailwind |
| **shadcn/ui** | (stile `base-nova`) | Componenti UI basati su Base UI, personalizzabili |
| **Base UI (React)** | `^1.6.0` | Primitivi UI accessibili |
| **Framer Motion** | `^12.42.2` | Animazioni avanzate e transizioni fluide |
| **Lucide React** | `^1.25.0` | Icone SVG |
| **class-variance-authority** | `^0.7.1` | Gestione varianti per componenti |
| **clsx** + **tailwind-merge** | `^2.1.1` / `^3.6.0` | Utility per merge condizionale di classi CSS |
| **next-themes** | `^0.4.6` | Supporto dark/light mode |

### 3.3 Backend & Database

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **Supabase** | `@supabase/supabase-js ^2.110.7` | Database PostgreSQL, Auth, RLS, RPC Functions |
| **@supabase/ssr** | `^0.12.3` | Integrazione SSR per Next.js (cookie-based session) |
| **PostgreSQL** | (gestito da Supabase) | Database relazionale con Row Level Security |

### 3.4 Autenticazione

| Tecnologia | Utilizzo |
|---|---|
| **Supabase Auth** | Email/Password per il professore |
| **Reset Password** | Tramite `resetPasswordForEmail` con redirect a `/auth/callback?next=/update-password` |

### 3.5 Form & Validazione

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **react-hook-form** | `^7.82.0` | Gestione stato dei form |
| **@hookform/resolvers** | `^5.4.0` | Integrazione Zod con react-hook-form |
| **Zod** | `^4.4.3` | Schema validation sia client che server |

### 3.6 Email Transazionali

| Tecnologia | Utilizzo |
|---|---|
| **Resend** | Invio email HTML per: conferma prenotazione, rifiuto, modifica orario, cancellazione, contatto ricevuto |

### 3.7 Protezione Anti-Spam

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **Cloudflare Turnstile** | `@marsidev/react-turnstile ^1.5.3` | Widget CAPTCHA invisibile su form prenotazione e contatto |

### 3.8 Date & Locale

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **date-fns** | `^4.4.0` | Parsing, formattazione e manipolazione date (locale `it`) |
| **react-day-picker** | `^10.0.1` | Calendario datepicker |

### 3.9 Notifiche UI

| Tecnologia | Versione | Utilizzo |
|---|---|---|
| **Sonner** | `^2.0.7` | Toast notifications |

### 3.10 Hosting & DevOps

| Tecnologia | Utilizzo |
|---|---|
| **Vercel** | Hosting, CI/CD, Cron Jobs |
| **PostCSS** | Pipeline CSS con `@tailwindcss/postcss` |
| **ESLint** | Linting con `eslint-config-next` |

### 3.11 Font

- **Inter** (Google Fonts) — Font principale, caricato via `next/font/google`.

---

## 4. Architettura del Database (PostgreSQL via Supabase)

### 4.1 Tabella `profiles`

Singolo record del professore. Estende `auth.users`. Un **trigger SQL** crea automaticamente il record al sign-up.

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID (PK, FK → `auth.users.id`) | Chiave primaria |
| `email` | TEXT | Email del professore |
| `first_name` | TEXT | Nome |
| `last_name` | TEXT | Cognome |
| `role` | TEXT | Sempre `admin` per il professore |
| `bio` | TEXT (nullable) | Biografia pubblica |
| `phone` | TEXT (nullable) | Numero di telefono |
| `avatar_url` | TEXT (nullable) | URL avatar |
| `teaching_subjects` | TEXT[] (nullable) | Array di materie insegnate |
| `created_at` | TIMESTAMPTZ | Data creazione |
| `updated_at` | TIMESTAMPTZ | Ultimo aggiornamento |

### 4.2 Tabella `lessons`

Cuore del sistema: gestisce sia gli slot disponibili sia le prenotazioni guest.

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID (PK) | Identificativo univoco — funge anche da "access token" per la gestione guest |
| `start_time` | TIMESTAMPTZ | Inizio lezione/slot |
| `end_time` | TIMESTAMPTZ | Fine lezione/slot |
| `is_available` | BOOLEAN | `true` = slot libero visibile pubblicamente |
| `status` | TEXT | Enum: `available`, `pending`, `confirmed` |
| `guest_name` | TEXT (nullable) | Nome dello studente guest |
| `guest_email` | TEXT (nullable) | Email dello studente guest |
| `notes` | TEXT (nullable) | Note dello studente |
| `reschedule_requested` | BOOLEAN | Flag: lo studente ha chiesto di spostare |
| `reschedule_notes` | TEXT (nullable) | Motivazione della richiesta di spostamento |

### 4.3 Tabella `contacts`

Messaggi ricevuti dal modulo di contatto.

| Colonna | Tipo | Note |
|---|---|---|
| `id` | UUID (PK) | Auto-generato |
| `name` | TEXT | Nome mittente |
| `email` | TEXT | Email mittente |
| `message` | TEXT | Corpo del messaggio |
| `created_at` | TIMESTAMPTZ | Data invio |

### 4.4 Funzioni RPC (PostgreSQL)

| Funzione | Descrizione |
|---|---|
| `split_and_book_slot(p_slot_id, p_req_start, p_req_end, p_notes, p_guest_name, p_guest_email)` | Prende un "Mega-Slot" (es. 14:00–18:00) e lo partiziona dinamicamente: crea il sotto-slot prenotato + eventuali slot residui prima/dopo. Gestisce concurrency con check atomico `is_available = true`. |

### 4.5 Row Level Security (RLS)

| Tabella | Policy Anonima | Policy Authenticated |
|---|---|---|
| `lessons` | `SELECT` solo dove `is_available = true` (slot liberi) | Full access per il professore |
| `contacts` | Nessun accesso | Lettura per il professore |
| `profiles` | Accesso limitato ai campi pubblici (bio, materie, nome) | Full access per il proprio profilo |

---

## 5. Mappa Completa delle Rotte (App Router)

### 5.1 Pagine Pubbliche

| Rotta | File | Descrizione |
|---|---|---|
| `/` | `src/app/page.tsx` | **Homepage** — Hero con bio del professore, materie (badge), CTA "Prenota" e "Contattami". |
| `/prenota` | `src/app/prenota/page.tsx` | **Calendario prenotazione** — Datepicker che evidenzia i giorni con slot disponibili, lista slot, form guest (nome+email+note) + Turnstile. Supporta Mega-Slot frazionabili. |
| `/contatti` | `src/app/contatti/page.tsx` | **Form contatto** — Nome, email, messaggio, checkbox privacy, Turnstile. |
| `/privacy` | `src/app/privacy/page.tsx` | **Privacy Policy** — Pagina GDPR completa. |
| `/gestisci/[id]` | `src/app/gestisci/[id]/page.tsx` | **Gestione prenotazione studente** — Protetta da "access token" (UUID lezione). Riepilogo data/ora, stato prenotazione, form reschedule con Turnstile. |
| `/update-password` | `src/app/update-password/page.tsx` | **Aggiornamento password** — Form per nuova password (primo accesso o reset). |

### 5.2 Pagine Protette (solo professore)

| Rotta | File | Descrizione |
|---|---|---|
| `/dashboard` | `src/app/dashboard/page.tsx` | **Dashboard professore** — Statistiche, tabs gestione lezioni (in attesa, confermate, disponibilità), messaggi contatto. |
| `/dashboard/profilo` | `src/app/dashboard/profilo/page.tsx` | **Modifica profilo** — Form con nome, cognome, bio, materie, phone, email pubblica. |

### 5.3 API Routes

| Rotta | File | Metodo | Descrizione |
|---|---|---|---|
| `/auth/callback` | `src/app/auth/callback/route.ts` | GET | Callback magic-link/reset. Scambia `code` per sessione. Redirect a `?next=` param. |
| `/api/cron/cleanup` | `src/app/api/cron/cleanup/route.ts` | GET | **Cron (ogni giorno alle 02:00 UTC)** — Elimina lezioni più vecchie di 365 giorni. |

### 5.4 Layout

| File | Descrizione |
|---|---|
| `src/app/layout.tsx` | **Root Layout** — Font Inter, Toaster (Sonner), AuthModal globale (Suspense). Lingua: `it`. |
| `src/app/dashboard/layout.tsx` | **Dashboard Layout** — Header con logo, nav, nome professore, pulsante logout. Redirect a homepage se non autenticato. |

---

## 6. Server Actions — Logica di Business

### 6.1 `features/auth/actions/` — Autenticazione

| Funzione | Descrizione |
|---|---|
| `loginWithPassword(formData)` | Login Email/Password con validazione Zod. Solo per il professore. |
| `logoutAction()` | Sign-out Supabase. |
| `resetPasswordAction(email)` | Invia email di reset password con redirect a `/auth/callback?next=/update-password`. |
| `updatePasswordAction(newPassword)` | Aggiorna la password dell'utente autenticato (usata al primo accesso). |

### 6.2 `features/booking/actions/` — Prenotazioni

| Funzione | Descrizione |
|---|---|
| `bookLesson(formData)` | 1) Validazione Zod 2) Verifica Turnstile server-side 3) Chiamata RPC `split_and_book_slot` 4) Invio email conferma con link `/gestisci/[id]`. |
| `requestReschedule(formData)` | 1) Validazione + Turnstile 2) Aggiorna `reschedule_requested = true` + `reschedule_notes` 3) Invia email al professore. |

### 6.3 `features/dashboard/actions/` — Gestione Calendario

| Funzione | Descrizione |
|---|---|
| `createSlot(formData)` | Crea slot singolo o **ricorrente** (ogni 7 giorni fino a `recurrence_end_date`). |
| `removeAvailableSlot(slotId)` | Elimina uno slot solo se `status = 'available'`. |
| `confirmLesson(lessonId)` | Imposta `status = 'confirmed'`. Genera link Google Calendar. Invia email allo studente. |
| `rejectLesson(lessonId)` | Resetta lo slot a `available`, pulisce campi guest. Invia email di rifiuto. |
| `updateLessonTime(lessonId, newStart, newEnd)` | Modifica orario. Resetta flag reschedule. Notifica studente. |
| `cancelLessonWithChoice(lessonId, keepAvailable)` | Se `keepAvailable`: resetta a disponibile. Se `false`: hard delete. Notifica studente. |

**Controllo accesso:** Tutte le funzioni richiedono `requireAuth()` che verifica che l'utente sia il professore.

### 6.4 `features/profile/actions/` — Gestione Profilo

| Funzione | Descrizione |
|---|---|
| `updateProfile(formData)` | Aggiorna `profiles` (nome, cognome, bio, phone, email, teaching_subjects). |

### 6.5 `features/contact/actions/` — Contatti

| Funzione | Descrizione |
|---|---|
| `sendContactMessage(formData)` | 1) Validazione Zod 2) Verifica Turnstile 3) Insert in `contacts` 4) Email notifica al professore. |
| `getContactMessages()` | Query contatti ordinati per data. |

---

## 7. Componenti UI — Inventario

### 7.1 Componenti per Feature (`src/features/`)

| Feature | Componente | Tipo | Descrizione |
|---|---|---|---|
| **auth** | `AuthModal` | Client | Modale di login. Attivato via query param `?auth=login`. Animazioni Framer Motion. Viste: Login, Forgot Password. |
| **auth** | `UpdatePasswordForm` | Client | Form per nuova password (primo accesso o reset). |
| **auth** | `LogoutButton` | Client | Pulsante logout con chiamata a `logoutAction()`. |
| **booking** | `BookingCalendar` | Client | Calendario prenotazione completo. Datepicker, lista slot, supporto Mega-Slot frazionabili, form guest + Turnstile. |
| **booking** | `RescheduleForm` | Client | Form per richiesta spostamento lezione. Textarea motivazione + Turnstile. |
| **booking** | `ManageBooking` | Client | Vista gestione prenotazione studente (`/gestisci/[id]`). |
| **dashboard** | `DashboardView` | Client | Vista principale: stats + tabs. |
| **dashboard** | `LessonTabs` | Client | Tabs: "In Attesa", "Confermate", "Disponibilità". Badge con conteggio. Azioni su ogni lezione. |
| **dashboard** | `CreateSlotDialog` | Client | Dialog per creare slot: data/ora, durata, ricorrenza. |
| **dashboard** | `EditLessonDialog` | Client | Dialog per modificare orario lezione. |
| **contact** | `ContactForm` | Client | Form contatto: nome, email, messaggio, checkbox privacy, Turnstile. |
| **contact** | `ContactMessagesList` | Client | Lista messaggi nella dashboard. |
| **landing** | `HeroSection` | Server | Hero con nome professore, bio, materie (badge), CTA. |
| **landing** | `PublicNavbar` | Server/Client | Navbar pubblica: logo, Home, Prenota, Contatti, Dashboard (se loggato). |
| **profile** | `ProfileForm` | Client | Form modifica profilo: nome, cognome, bio, phone, email, materie. |
| **legal** | `PrivacyContent` | Server | Contenuto Privacy Policy GDPR. |

### 7.2 Componenti UI Base (`src/components/ui/`) — shadcn/ui

Componenti shadcn installati: `alert-dialog`, `badge`, `button`, `calendar`, `card`, `checkbox`, `dialog`, `input`, `label`, `popover`, `radio-group`, `select`, `sonner`, `table`, `tabs`, `textarea`.

---

## 8. Middleware (`src/middleware.ts`)

Il middleware Next.js gestisce:

1. **Refresh sessione Supabase** — Ogni request passa per `updateSession()` che rinnova i cookie JWT.
2. **Protezione rotte `/dashboard`** — Se non autenticato → redirect a `/?auth=login`.

**Matcher pattern:** Esclude `_next/static`, `_next/image`, `favicon.ico`, file media.

---

## 9. Flussi Email

| Trigger | Destinatario | Oggetto | Contenuto chiave |
|---|---|---|---|
| Prenotazione effettuata | Studente (guest) | `Conferma Richiesta Prenotazione` | Riepilogo orario + CTA "Gestisci Prenotazione" (link privato) |
| Lezione confermata | Studente (guest) | `Lezione Confermata!` | Data confermata + link Google Calendar + link "Gestisci" |
| Lezione rifiutata | Studente (guest) | `Aggiornamento Prenotazione` | Messaggio rifiuto + invito a riprovare |
| Orario modificato | Studente (guest) | `Aggiornamento Orario Lezione` | Nuovo orario + link Google Calendar |
| Lezione annullata | Studente (guest) | `Lezione Annullata` | Comunicazione annullamento |
| Richiesta reschedule | Professore | `⚠️ Richiesta Spostamento da [nome]` | Dettagli lezione + motivazione studente |
| Contatto ricevuto | Professore | `Nuovo messaggio da [nome]` | Nome, email, messaggio completo |

---

## 10. Cron Jobs (Vercel)

Configurati in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

| Job | Schedule | Descrizione |
|---|---|---|
| **Cleanup** | Ogni giorno alle 02:00 UTC | Hard delete di tutte le lezioni con `end_time` > 365 giorni fa. |

---

## 11. Sicurezza & Privacy

### 11.1 Validazione

- **Doppia validazione Zod** — Tutti gli input validati sia client-side (react-hook-form) sia server-side (Server Actions) con gli stessi schema Zod.

### 11.2 Anti-Spam

- **Cloudflare Turnstile** — CAPTCHA invisibile su ogni form pubblico (prenotazione, contatto, reschedule). Token verificato server-side.

### 11.3 Autenticazione & Autorizzazione

- **Supabase Auth** — Sessioni cookie-based gestite via middleware.
- **`requireAuth()`** — Utility server-side che verifica che l'utente sia il professore. Usata in tutte le dashboard Server Actions.
- **Service Role Key** — Usata solo server-side per operazioni privilegiate: `createAdminClient()`.

### 11.4 Row Level Security (RLS)

- **Slot pubblici**: solo `is_available = true` visibili a utenti anonimi.
- **Dati guest nascosti**: quando uno slot viene prenotato, diventa `is_available = false` → scompare dalla vista pubblica.
- **Controllo concorrenza**: la RPC `split_and_book_slot` verifica atomicamente la disponibilità.

### 11.5 GDPR

- **Privacy Policy** integrata e linkata in ogni form.
- **Consenso esplicito** via checkbox nel form contatti.
- **Data minimization**: raccolti solo nome, email, note.

---

## 12. Variabili d'Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=         # URL del progetto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Chiave pubblica (anon) di Supabase
SUPABASE_SERVICE_ROLE_KEY=        # Chiave privata (service role) — SOLO server-side

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=   # Chiave pubblica del widget Turnstile
TURNSTILE_SECRET_KEY=             # Chiave segreta per verifica server-side

# Resend (Email)
RESEND_API_KEY=                   # API key Resend

# App
NEXT_PUBLIC_SITE_URL=             # URL base del sito (per link nelle email)

# Cron (opzionale)
CRON_SECRET=                      # Secret per protezione endpoint cron
```

---

## 13. Configurazioni Progetto

### 13.1 TypeScript (`tsconfig.json`)

- Target: `ES2017`
- Module Resolution: `bundler`
- Strict mode: `true`
- Path alias: `@/*` → `./src/*`
- Plugin: `next`

### 13.2 CSS Design System (`globals.css`)

- **Tailwind v4** con `@import "tailwindcss"`
- **Design tokens** via CSS custom properties (light + dark mode)
- **Palette**: da definire durante Sprint 2 (landing page)

### 13.3 PostCSS

- Plugin: `@tailwindcss/postcss`

### 13.4 ESLint

- Config: `eslint-config-next`

---

## 14. Pattern e Convenzioni di Codice

1. **Server Components di default** — Le pagine sono tutte Server Components async. I componenti interattivi sono Client Components con `'use client'`.
2. **Server Actions con `'use server'`** — Tutta la business logic è nelle cartelle `actions/` dentro `features/`. Nessuna API Route custom (eccetto cron).
3. **Supabase dual-client** — `createClient()` per operazioni con i permessi dell'utente corrente (rispetta RLS). `createAdminClient()` per operazioni privilegiate.
4. **Validazione Zod bidirezionale** — Stesso schema usato per type inference TypeScript e validazione runtime.
5. **Revalidation** — Dopo ogni mutazione, `revalidatePath()` invalida le cache delle pagine interessate.
6. **Error handling** — Pattern consistente: `{ error: string }` o `{ success: true }` come return type.
7. **Email HTML inline** — Template HTML inline con stili inline (compatibilità email client).
8. **Google Calendar integration** — Link dinamici generati in formato `YYYYMMDDTHHMMSSZ`.
9. **Internazionalizzazione** — App completamente in italiano. Locale `it` per date-fns. `lang="it"` nell'HTML.
10. **VSA enforcement** — Business logic SOLO dentro `src/features/`. Le pagine `app/` importano e compongono, non implementano logica.
