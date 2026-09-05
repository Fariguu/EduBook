-- ==========================================================
-- EduBook: Test Environment Reset Script
-- ==========================================================
-- Questo script svuota i dati dinamici dei test (lezioni, contatti)
-- e ripristina/garantisce l'esistenza del profilo docente di test (gabri@example.com).

-- 1. Svuotamento lezioni e contatti
TRUNCATE TABLE public.lessons CASCADE;
TRUNCATE TABLE public.contacts CASCADE;

-- 2. Garantire/aggiornare il profilo admin di test per gabri@example.com
DO $$
DECLARE
  v_admin_email TEXT := 'gabri@example.com';
  v_user_id UUID;
BEGIN
  -- Trova l'id utente in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_admin_email LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Aggiorna la password per essere certi delle credenziali (PredefinedPassword123!)
    UPDATE auth.users
    SET encrypted_password = extensions.crypt('PredefinedPassword123!', extensions.gen_salt('bf', 10)),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
        raw_user_meta_data = jsonb_build_object('first_name', 'Gabriele', 'last_name', 'Farigu'),
        confirmation_token = COALESCE(confirmation_token, ''),
        recovery_token = COALESCE(recovery_token, ''),
        email_change_token_new = COALESCE(email_change_token_new, ''),
        email_change = COALESCE(email_change, ''),
        phone_change = COALESCE(phone_change, ''),
        phone_change_token = COALESCE(phone_change_token, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        reauthentication_token = COALESCE(reauthentication_token, ''),
        updated_at = now()
    WHERE id = v_user_id;

    -- Garantisci la presenza del record corrispondente in auth.identities
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id AND provider = 'email') THEN
      INSERT INTO auth.identities (
        id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id::text,
        v_user_id,
        jsonb_build_object('sub', v_user_id::text, 'email', v_admin_email, 'email_verified', true),
        'email',
        now(),
        now(),
        now()
      );
    ELSE
      UPDATE auth.identities
      SET identity_data = jsonb_build_object('sub', v_user_id::text, 'email', v_admin_email, 'email_verified', true),
          updated_at = now()
      WHERE user_id = v_user_id AND provider = 'email';
    END IF;

    -- Upsert nel profilo public.profiles
    INSERT INTO public.profiles (
      id, email, first_name, last_name, role, bio, teaching_subjects, updated_at
    ) VALUES (
      v_user_id,
      v_admin_email,
      'Gabriele',
      'Farigu',
      'admin'::user_role,
      'Docente di Matematica e Fisica con pluriennale esperienza nell''insegnamento superiore.',
      ARRAY['Matematica', 'Fisica', 'Analisi 1'],
      now()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin'::user_role,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      bio = EXCLUDED.bio,
      teaching_subjects = EXCLUDED.teaching_subjects,
      updated_at = now();

    RAISE NOTICE 'Ambiente di test resettato e profilo docente % aggiornato con successo.', v_admin_email;
  ELSE
    RAISE NOTICE 'Attenzione: utente % non trovato in auth.users. Se necessario eseguire supabase_seed.sql per crearlo.', v_admin_email;
  END IF;
END $$;
