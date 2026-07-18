-- EduBook SQL Seed & Promotion Script
-- Run this script in the Supabase SQL Editor to initialize or promote the professor account.

-- ==========================================
-- OPTION 1: PROMOTE AN EXISTING USER TO ADMIN
-- ==========================================
-- If the professor has already signed up via the application,
-- run this query to set their role to 'admin' (professor).
-- Replace 'professore@example.com' with the actual email address used.

UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE email = 'gabri@example.com'; -- <-- Replace with actual professor email


-- ==========================================
-- OPTION 2: CREATE THE PROFESSOR DIRECTLY VIA SQL
-- ==========================================
-- This creates a new user in auth.users and public.profiles.
-- Change the email, password, first_name, last_name, and bio as needed.

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  prof_email TEXT := 'gabri@example.com'; -- <-- Replace with professor's email
  prof_password TEXT := 'PredefinedPassword123!'; -- <-- Predefined temporary password
  prof_first_name TEXT := 'Gabriele';
  prof_last_name TEXT := 'Farigu';
  prof_bio TEXT := 'Docente di Matematica e Fisica con pluriennale esperienza nell''insegnamento superiore.';
  prof_subjects TEXT[] := ARRAY['Matematica', 'Fisica', 'Analisi 1'];
BEGIN
  -- Check if user already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = prof_email) THEN
    RAISE NOTICE 'User with email % already exists. Promoting to admin...', prof_email;
    UPDATE public.profiles SET role = 'admin'::user_role WHERE email = prof_email;
  ELSE
    -- 1. Insert into auth.users (Supabase Auth)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      prof_email,
      extensions.crypt(prof_password, extensions.gen_salt('bf')),
      now(),
      null,
      null,
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('first_name', prof_first_name, 'last_name', prof_last_name),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    -- 2. Insert into public.profiles (will be matched with trigger, but we enforce admin role here)
    -- If the handle_new_user trigger already executed and created a profile with 'user' role:
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = new_user_id) THEN
      UPDATE public.profiles 
      SET role = 'admin'::user_role,
          first_name = prof_first_name,
          last_name = prof_last_name,
          email = prof_email,
          bio = prof_bio,
          teaching_subjects = prof_subjects
      WHERE id = new_user_id;
    ELSE
      INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        bio,
        teaching_subjects,
        created_at,
        updated_at
      ) VALUES (
        new_user_id,
        prof_email,
        prof_first_name,
        prof_last_name,
        'admin'::user_role,
        prof_bio,
        prof_subjects,
        now(),
        now()
      );
    END IF;

    RAISE NOTICE 'Professor account created successfully with email %', prof_email;
  END IF;
END $$;
