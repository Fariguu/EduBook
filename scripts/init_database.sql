-- ==============================================================================
-- EduBook - Inizializzazione Completa del Database Supabase (PostgreSQL)
-- ==============================================================================
-- Esegui questo script per configurare da zero l intero database di EduBook
-- nell SQL Editor della dashboard di Supabase.
--
-- Include:
-- 1. Estensioni necessarie (uuid-ossp, pgcrypto)
-- 2. Tipi Enumerati personalizzati (user_role, lesson_status)
-- 3. Tabelle principali con tutti i vincoli e le colonne (profiles, lessons, contacts)
-- 4. Indici di prestazione per calendario e ricerche
-- 5. Trigger per l aggiornamento automatico del timestamp updated_at
-- 6. Trigger per la sincronizzazione del profilo utente alla registrazione (auth.users)
-- 7. Funzione stored RPC split_and_book_slot per la gestione atomica dei Mega-Slot
-- 8. Abilitazione Row Level Security (RLS) e policy di sicurezza

-- ------------------------------------------------------------------------------
-- 1. Estensioni
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. Tipi Enumerati (ENUMs)
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('student', 'professor', 'admin', 'superadmin');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_status') THEN
    CREATE TYPE public.lesson_status AS ENUM ('available', 'pending', 'confirmed', 'rejected', 'cancelled');
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. Funzione Helper Timestamp: update_updated_at_column
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. Tabella: public.profiles (Docente e configurazioni landing page)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  headline TEXT DEFAULT 'Docente di Scienze Matematiche',
  bio TEXT DEFAULT 'Docente qualificato con pluriennale esperienza nell insegnamento. Metodo personalizzato per scuola superiore e universita.',
  phone TEXT,
  role public.user_role DEFAULT 'professor'::public.user_role,
  teaching_subjects TEXT[] DEFAULT ARRAY['Matematica', 'Fisica', 'Analisi 1'],
  subject_details JSONB DEFAULT '{}'::jsonb,
  suggested_subjects TEXT[] DEFAULT ARRAY['Matematica', 'Fisica', 'Geometria', 'Analisi 1', 'Algebra Lineare'],
  avatar_url TEXT,
  why_choose_us JSONB DEFAULT NULL,
  hero_card JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Dati anagrafici, materie e configurazioni personalizzate del docente';
COMMENT ON COLUMN public.profiles.why_choose_us IS 'Configurazione dinamica della sezione Gestione Percorso (titolo, sottotitolo, schede didattiche)';
COMMENT ON COLUMN public.profiles.hero_card IS 'Configurazione dinamica della scheda informativa in primo piano nella Hero';

CREATE OR REPLACE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 5. Tabella: public.lessons (Disponibilita, Mega-Slot e Prenotazioni)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  status public.lesson_status NOT NULL DEFAULT 'available'::public.lesson_status,
  guest_name TEXT,
  guest_email TEXT,
  notes TEXT,
  rejection_reason TEXT,
  reschedule_requested BOOLEAN NOT NULL DEFAULT false,
  reschedule_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_lesson_times_order CHECK (end_time > start_time)
);

COMMENT ON TABLE public.lessons IS 'Slot di disponibilita del docente e lezioni prenotate dagli studenti guest';

CREATE OR REPLACE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indici per ottimizzazione query calendario e dashboard
CREATE INDEX IF NOT EXISTS idx_lessons_start_time ON public.lessons (start_time ASC);
CREATE INDEX IF NOT EXISTS idx_lessons_status ON public.lessons (status);
CREATE INDEX IF NOT EXISTS idx_lessons_availability ON public.lessons (is_available, status, start_time);

-- ------------------------------------------------------------------------------
-- 6. Tabella: public.contacts (Messaggi dal modulo pubblico /contatti)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  replied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contacts IS 'Messaggi inviati dagli utenti tramite la pagina /contatti';

CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);

-- ------------------------------------------------------------------------------
-- 7. Trigger Registrazione Utente: handle_new_user
-- ------------------------------------------------------------------------------
-- Crea automaticamente il record in public.profiles quando un nuovo account docente
-- viene registrato in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'professor'::public.user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 8. Stored Procedure RPC: split_and_book_slot
-- ------------------------------------------------------------------------------
-- Gestisce in modo atomico la prenotazione di uno slot o sotto-intervallo di un Mega-Slot.
-- Se lo studente prenota una frazione di uno slot piu ampio, il sistema crea gli slot
-- residui liberi prima e/o dopo la finestra richiesta.
CREATE OR REPLACE FUNCTION public.split_and_book_slot(
  p_slot_id UUID,
  p_req_start TIMESTAMPTZ,
  p_req_end TIMESTAMPTZ,
  p_notes TEXT,
  p_guest_name TEXT,
  p_guest_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_slot public.lessons%ROWTYPE;
  v_new_lesson_id UUID;
BEGIN
  -- Validazione base delle date
  IF p_req_end <= p_req_start THEN
    RETURN jsonb_build_object('success', false, 'error', 'Orario di fine non valido.');
  END IF;

  -- Blocco della riga per evitare race conditions (concurrency check)
  SELECT * INTO v_slot
  FROM public.lessons
  WHERE id = p_slot_id
    AND is_available = true
    AND status = 'available'::public.lesson_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lo slot selezionato non e piu disponibile.');
  END IF;

  -- Verifica che la finestra richiesta sia contenuta nello slot
  IF p_req_start < v_slot.start_time OR p_req_end > v_slot.end_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'La finestra richiesta non e contenuta nello slot disponibile.');
  END IF;

  -- 1. Se c e spazio residuo prima, crea un nuovo slot disponibile
  IF p_req_start > v_slot.start_time THEN
    INSERT INTO public.lessons (
      start_time,
      end_time,
      is_available,
      status
    ) VALUES (
      v_slot.start_time,
      p_req_start,
      true,
      'available'::public.lesson_status
    );
  END IF;

  -- 2. Se c e spazio residuo dopo, crea un nuovo slot disponibile
  IF p_req_end < v_slot.end_time THEN
    INSERT INTO public.lessons (
      start_time,
      end_time,
      is_available,
      status
    ) VALUES (
      p_req_end,
      v_slot.end_time,
      true,
      'available'::public.lesson_status
    );
  END IF;

  -- 3. Aggiorna lo slot originale con i dati della prenotazione guest in attesa di conferma
  UPDATE public.lessons
  SET
    start_time = p_req_start,
    end_time = p_req_end,
    is_available = false,
    status = 'pending'::public.lesson_status,
    guest_name = p_guest_name,
    guest_email = p_guest_email,
    notes = p_notes,
    reschedule_requested = false,
    reschedule_notes = NULL,
    updated_at = now()
  WHERE id = p_slot_id;

  RETURN jsonb_build_object(
    'success', true,
    'new_lesson_id', p_slot_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 9. Row Level Security (RLS) & Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Policies per public.profiles
DROP POLICY IF EXISTS "Profili pubblici consultabili da chiunque" ON public.profiles;
CREATE POLICY "Profili pubblici consultabili da chiunque"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Docente aggiorna il proprio profilo" ON public.profiles;
CREATE POLICY "Docente aggiorna il proprio profilo"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies per public.lessons
DROP POLICY IF EXISTS "Slot disponibili visibili a tutti" ON public.lessons;
CREATE POLICY "Slot disponibili visibili a tutti"
  ON public.lessons FOR SELECT
  USING (is_available = true AND status = 'available'::public.lesson_status);

DROP POLICY IF EXISTS "Docente ha pieno controllo sulle lezioni" ON public.lessons;
CREATE POLICY "Docente ha pieno controllo sulle lezioni"
  ON public.lessons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies per public.contacts
DROP POLICY IF EXISTS "Chiunque puo inviare un messaggio di contatto" ON public.contacts;
CREATE POLICY "Chiunque puo inviare un messaggio di contatto"
  ON public.contacts FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Solo il docente puo visualizzare e gestire i messaggi" ON public.contacts;
CREATE POLICY "Solo il docente puo visualizzare e gestire i messaggi"
  ON public.contacts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
