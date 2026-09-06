-- ==========================================================
-- EduBook: Add why_choose_us and hero_card to profiles
-- ==========================================================
-- Esegui questa query nell'SQL Editor del tuo progetto Supabase.
-- Aggiunge le colonne JSONB per la personalizzazione della landing page:
-- 1) why_choose_us: sezione "Gestione Percorso" (Perché Scegliere Questo Percorso)
-- 2) hero_card: scheda informativa in evidenza nella hero

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS why_choose_us JSONB DEFAULT NULL;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hero_card JSONB DEFAULT NULL;

COMMENT ON COLUMN public.profiles.why_choose_us IS 'Configurazione personalizzata della sezione Gestione Percorso (titolo, sottotitolo, lista pillars)';
COMMENT ON COLUMN public.profiles.hero_card IS 'Configurazione personalizzata della scheda informativa in evidenza nella hero (righe informative e nota a piè di pagina)';
