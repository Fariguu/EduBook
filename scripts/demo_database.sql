-- ==============================================================================
-- EduBook - Schema e Dati Dimostrativi per Ambiente Demo Isolato
-- ==============================================================================
-- Esegui questo script nell SQL Editor di Supabase.
-- Crea tabelle clonate con suffisso _demo e colonna session_id per consentire
-- a ciascun visitatore del portfolio di testare l applicazione su una propria
-- sandbox personale senza toccare il database di produzione.
--
-- Dati predefiniti:
-- Docente: Prof. Mario Rossi
-- Materie: Matematica, Fisica, Analisi 1, Chimica (online e in presenza)

-- ------------------------------------------------------------------------------
-- 0. Tipi Enumerati (se non gia definiti)
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
-- 1. Tabella: public.profiles_demo
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles_demo (
  id UUID DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT DEFAULT 'Mario',
  last_name TEXT DEFAULT 'Rossi',
  headline TEXT DEFAULT 'Docente di Matematica e Fisica per Scuole Superiori e Universita',
  bio TEXT DEFAULT 'Laureato con lode in Fisica Applicata, da oltre 8 anni supporto studenti di scuola superiore e universita nel superamento di debiti formativi ed esami universitari. Metodo pratico, personalizzato e orientato alla risoluzione autonoma dei problemi. Lezioni sia online con tavoletta grafica che in presenza.',
  phone TEXT DEFAULT '+39 340 1234567',
  role public.user_role DEFAULT 'professor'::public.user_role,
  teaching_subjects TEXT[] DEFAULT ARRAY['Matematica', 'Fisica', 'Analisi 1', 'Chimica'],
  subject_details JSONB DEFAULT '{
    "Matematica": "Algebra, Geometria Analitica, Trigonometria, Goniometria e Studio di Funzione per scuole superiori.",
    "Fisica": "Meccanica classica, Termodinamica, Elettromagnetismo e Ottica.",
    "Analisi 1": "Limiti, Derivate, Integrali definiti e indefiniti, Serie numeriche ed Equazioni Differenziali.",
    "Chimica": "Stechiometria, Struttura atomica, Legami chimici e Reazioni acido-base."
  }'::jsonb,
  suggested_subjects TEXT[] DEFAULT ARRAY['Matematica', 'Fisica', 'Analisi 1', 'Chimica', 'Algebra Lineare', 'Geometria'],
  avatar_url TEXT DEFAULT NULL,
  why_choose_us JSONB DEFAULT NULL,
  hero_card JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id)
);

COMMENT ON TABLE public.profiles_demo IS 'Profili sandbox dimostrativi isolati per session_id';

-- ------------------------------------------------------------------------------
-- 2. Tabella: public.lessons_demo
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons_demo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
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
  CONSTRAINT check_demo_lesson_times CHECK (end_time > start_time)
);

COMMENT ON TABLE public.lessons_demo IS 'Lezioni e disponibilita sandbox per session_id';

CREATE INDEX IF NOT EXISTS idx_lessons_demo_session ON public.lessons_demo (session_id, status, start_time);

-- ------------------------------------------------------------------------------
-- 3. Tabella: public.contacts_demo
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contacts_demo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  replied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.contacts_demo IS 'Messaggi di contatto sandbox per session_id';

CREATE INDEX IF NOT EXISTS idx_contacts_demo_session ON public.contacts_demo (session_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Procedura: seed_demo_session
-- ------------------------------------------------------------------------------
-- Inizializza o ripristina un set di dati verosimili e completi per il session_id specificato.
CREATE OR REPLACE FUNCTION public.seed_demo_session(p_session_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_base_date DATE := CURRENT_DATE;
BEGIN
  -- 0. Pulizia automatica di sessioni demo inattive da oltre 24 ore
  DELETE FROM public.lessons_demo WHERE updated_at < now() - interval '24 hours';
  DELETE FROM public.contacts_demo WHERE created_at < now() - interval '24 hours';
  DELETE FROM public.profiles_demo WHERE updated_at < now() - interval '24 hours';

  -- 1. Pulizia eventuali dati pregressi per questa sessione
  DELETE FROM public.lessons_demo WHERE session_id = p_session_id;
  DELETE FROM public.contacts_demo WHERE session_id = p_session_id;
  DELETE FROM public.profiles_demo WHERE session_id = p_session_id;

  -- 2. Inserimento Profilo Docente: Prof. Mario Rossi
  INSERT INTO public.profiles_demo (
    session_id,
    email,
    first_name,
    last_name,
    headline,
    bio,
    phone,
    role,
    teaching_subjects,
    subject_details,
    suggested_subjects,
    why_choose_us,
    hero_card
  ) VALUES (
    p_session_id,
    'mario.rossi@edubook.it',
    'Mario',
    'Rossi',
    'Docente di Matematica e Fisica per Scuole Superiori e Universita',
    'Laureato con lode in Fisica Applicata, da oltre 8 anni supporto studenti di scuola superiore e universita nel superamento di debiti formativi ed esami universitari. Metodo pratico, personalizzato e orientato alla risoluzione autonoma dei problemi. Lezioni sia online con tavoletta grafica che in presenza.',
    '+39 340 1234567',
    'professor'::public.user_role,
    ARRAY['Matematica', 'Fisica', 'Analisi 1', 'Chimica'],
    '{
      "Matematica": "Algebra, Geometria Analitica, Trigonometria, Goniometria e Studio di Funzione per scuole superiori.",
      "Fisica": "Meccanica classica, Termodinamica, Elettromagnetismo e Ottica.",
      "Analisi 1": "Limiti, Derivate, Integrali definiti e indefiniti, Serie numeriche ed Equazioni Differenziali.",
      "Chimica": "Stechiometria, Struttura atomica, Legami chimici e Reazioni acido-base."
    }'::jsonb,
    ARRAY['Matematica', 'Fisica', 'Analisi 1', 'Chimica', 'Algebra Lineare', 'Geometria'],
    '{
      "title": "Un Metodo Didattico Collaudato",
      "subtitle": "Dalla comprensione intuitiva dei concetti alla piena padronanza degli esercizi d esame",
      "pillars": [
        {
          "icon": "Target",
          "title": "Percorso Personalizzato",
          "description": "Ogni spiegazione parte dal livello reale dello studente, colmando le lacune pregresse senza procedere a memoria."
        },
        {
          "icon": "Laptop",
          "title": "Modalita Ibrida Flessibile",
          "description": "Lezioni sia online su lavagna digitale interattiva con appunti PDF inviati a fine lezione, sia in presenza."
        },
        {
          "icon": "Award",
          "title": "Preparazione Verifiche ed Esami",
          "description": "Esercitazioni mirate sui testi d esame universitari e simulazioni con tempi scanditi per affrontare le prove con sicurezza."
        },
        {
          "icon": "Clock",
          "title": "Assistenza Continua",
          "description": "Possibilita di inviare dubbi veloci ed esercizi su WhatsApp tra una lezione e l altra per non bloccare lo studio."
        }
      ]
    }'::jsonb,
    '{
      "items": [
        { "label": "Modalita didattica", "value": "Online e In Presenza" },
        { "label": "Materie principali", "value": "Matematica e Fisica" },
        { "label": "Prenotazione autonoma", "value": "Diretta in 2 minuti" }
      ],
      "footnote": "Nessun account studente richiesto - seleziona lo slot e conferma in autonomia."
    }'::jsonb
  );

  -- 3. Inserimento Slot Disponibili (giorni futuri)
  -- Domani: Mega-Slot 15:00 - 18:00 (frazionabile)
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status
  ) VALUES (
    p_session_id,
    (v_base_date + 1)::timestamp + time '15:00:00',
    (v_base_date + 1)::timestamp + time '18:00:00',
    true,
    'available'::public.lesson_status
  );

  -- Dopodomani: Slot mattutino 10:00 - 12:00
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status
  ) VALUES (
    p_session_id,
    (v_base_date + 2)::timestamp + time '10:00:00',
    (v_base_date + 2)::timestamp + time '12:00:00',
    true,
    'available'::public.lesson_status
  );

  -- Tra 3 giorni: Slot pomeridiano 16:30 - 18:00
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status
  ) VALUES (
    p_session_id,
    (v_base_date + 3)::timestamp + time '16:30:00',
    (v_base_date + 3)::timestamp + time '18:00:00',
    true,
    'available'::public.lesson_status
  );

  -- 4. Inserimento Lezioni in Attesa di Conferma (Pending)
  -- Domani 18:00 - 19:00 (Alessandro Bianchi)
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status,
    guest_name, guest_email, notes
  ) VALUES (
    p_session_id,
    (v_base_date + 1)::timestamp + time '18:00:00',
    (v_base_date + 1)::timestamp + time '19:00:00',
    false,
    'pending'::public.lesson_status,
    'Alessandro Bianchi',
    'alessandro.bianchi@example.com',
    'Studio di funzione con logaritmi ed esponenziali in vista della verifica di matematica di venerdi.'
  );

  -- Tra 2 giorni 15:00 - 16:30 (Chiara Esposito - con richiesta spostamento)
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status,
    guest_name, guest_email, notes, reschedule_requested, reschedule_notes
  ) VALUES (
    p_session_id,
    (v_base_date + 2)::timestamp + time '15:00:00',
    (v_base_date + 2)::timestamp + time '16:30:00',
    false,
    'pending'::public.lesson_status,
    'Chiara Esposito',
    'chiara.esposito@example.com',
    'Esercizi di Fisica su potenziale elettrostatico e condensatori in serie/parallelo.',
    true,
    'Salve Professore, se possibile preferirei anticipare alle 14:30 perche alle 16:45 ho un impegno sportivo.'
  );

  -- 5. Inserimento Lezioni Gia Confermate (Confirmed)
  -- Tra 2 giorni 17:00 - 18:30 (Lorenzo Verdi)
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status,
    guest_name, guest_email, notes
  ) VALUES (
    p_session_id,
    (v_base_date + 2)::timestamp + time '17:00:00',
    (v_base_date + 2)::timestamp + time '18:30:00',
    false,
    'confirmed'::public.lesson_status,
    'Lorenzo Verdi',
    'lorenzo.verdi@example.com',
    'Preparazione esame universitario Analisi 1: integrali impropri e serie di Taylor.'
  );

  -- Tra 4 giorni 11:00 - 12:00 (Sara Romano)
  INSERT INTO public.lessons_demo (
    session_id, start_time, end_time, is_available, status,
    guest_name, guest_email, notes
  ) VALUES (
    p_session_id,
    (v_base_date + 4)::timestamp + time '11:00:00',
    (v_base_date + 4)::timestamp + time '12:00:00',
    false,
    'confirmed'::public.lesson_status,
    'Sara Romano',
    'sara.romano@example.com',
    'Chimica Generale: bilanciamento redox e calcolo stechiometrico del reagente limitante.'
  );

  -- 6. Inserimento Messaggi dal Form Contatti
  INSERT INTO public.contacts_demo (
    session_id, name, email, message, replied, created_at
  ) VALUES (
    p_session_id,
    'Marco Galli',
    'marco.galli@example.com',
    'Buongiorno Professore, vorrei sapere se effettua anche corsi di preparazione mirati per il test d ingresso di Ingegneria (TOLC-I) e quali sono le modalita di svolgimento online. Grazie mille!',
    false,
    now() - interval '3 hours'
  ), (
    p_session_id,
    'Elena Moretti',
    'elena.moretti@example.com',
    'Salve Prof. Rossi, mio figlio frequenta il quarto anno di Liceo Scientifico e ha bisogno di supporto in Fisica (dinamica e gravitazione). E possibile organizzare lezioni anche in presenza a domicilio? Attendo riscontro.',
    true,
    now() - interval '1 day'
  );

  RETURN jsonb_build_object('success', true, 'session_id', p_session_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 5. Stored Procedure RPC: split_and_book_slot_demo
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.split_and_book_slot_demo(
  p_session_id UUID,
  p_slot_id UUID,
  p_req_start TIMESTAMPTZ,
  p_req_end TIMESTAMPTZ,
  p_notes TEXT,
  p_guest_name TEXT,
  p_guest_email TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_slot public.lessons_demo%ROWTYPE;
BEGIN
  IF p_req_end <= p_req_start THEN
    RETURN jsonb_build_object('success', false, 'error', 'Orario di fine non valido.');
  END IF;

  SELECT * INTO v_slot
  FROM public.lessons_demo
  WHERE id = p_slot_id
    AND session_id = p_session_id
    AND is_available = true
    AND status = 'available'::public.lesson_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lo slot selezionato non e piu disponibile.');
  END IF;

  IF p_req_start < v_slot.start_time OR p_req_end > v_slot.end_time THEN
    RETURN jsonb_build_object('success', false, 'error', 'La finestra richiesta non e contenuta nello slot.');
  END IF;

  -- Slot residuo precedente
  IF p_req_start > v_slot.start_time THEN
    INSERT INTO public.lessons_demo (
      session_id, start_time, end_time, is_available, status
    ) VALUES (
      p_session_id, v_slot.start_time, p_req_start, true, 'available'::public.lesson_status
    );
  END IF;

  -- Slot residuo successivo
  IF p_req_end < v_slot.end_time THEN
    INSERT INTO public.lessons_demo (
      session_id, start_time, end_time, is_available, status
    ) VALUES (
      p_session_id, p_req_end, v_slot.end_time, true, 'available'::public.lesson_status
    );
  END IF;

  -- Aggiorna slot prenotato
  UPDATE public.lessons_demo
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
  WHERE id = p_slot_id AND session_id = p_session_id;

  RETURN jsonb_build_object('success', true, 'new_lesson_id', p_slot_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles_demo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons_demo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts_demo ENABLE ROW LEVEL SECURITY;

-- Consentiamo accesso pubblico/anonimo alle tabelle demo filtrando per sessione tramite backend
DROP POLICY IF EXISTS "Accesso completo profiles_demo" ON public.profiles_demo;
CREATE POLICY "Accesso completo profiles_demo" ON public.profiles_demo FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso completo lessons_demo" ON public.lessons_demo;
CREATE POLICY "Accesso completo lessons_demo" ON public.lessons_demo FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Accesso completo contacts_demo" ON public.contacts_demo;
CREATE POLICY "Accesso completo contacts_demo" ON public.contacts_demo FOR ALL USING (true) WITH CHECK (true);
