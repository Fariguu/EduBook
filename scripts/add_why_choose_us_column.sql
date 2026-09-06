-- ==========================================================
-- EduBook: Add why_choose_us to profiles
-- ==========================================================
-- Esegui questa query nell'SQL Editor del tuo progetto Supabase.
-- Aggiunge la colonna JSONB per la personalizzazione della sezione
-- "Perché Scegliere Questo Percorso" della landing page.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS why_choose_us JSONB DEFAULT NULL;

COMMENT ON COLUMN public.profiles.why_choose_us IS 'Configurazione personalizzata della sezione Perché Scegliere Questo Percorso (titolo, sottotitolo, lista pillars)';
