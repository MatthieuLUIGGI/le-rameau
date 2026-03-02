-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.actualites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  titre text NOT NULL,
  extrait text NOT NULL,
  contenu text NOT NULL,
  image_url text,
  pdf_url text,
  priorite text DEFAULT 'normale'::text CHECK (priorite = ANY (ARRAY['basse'::text, 'normale'::text, 'haute'::text])),
  date_expiration timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT actualites_pkey PRIMARY KEY (id)
);
CREATE TABLE public.admin_board_password (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  password_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT admin_board_password_pkey PRIMARY KEY (id)
);
CREATE TABLE public.assemblee_generale (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position integer DEFAULT 0,
  pv_titre text,
  pv_date text,
  pv_type text,
  pv_url text,
  rapport_titre text,
  rapport_date text,
  rapport_type text,
  rapport_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT assemblee_generale_pkey PRIMARY KEY (id)
);
CREATE TABLE public.conseil_password (
  page_name text NOT NULL,
  password_value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT conseil_password_pkey PRIMARY KEY (page_name)
);
CREATE TABLE public.conseil_syndical (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position integer NOT NULL,
  oj_titre text,
  oj_date text,
  oj_type text DEFAULT 'empty'::text CHECK (oj_type = ANY (ARRAY['file'::text, 'link'::text, 'empty'::text])),
  oj_url text,
  cr_titre text,
  cr_date text,
  cr_type text DEFAULT 'empty'::text CHECK (cr_type = ANY (ARRAY['file'::text, 'link'::text, 'empty'::text])),
  cr_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT conseil_syndical_pkey PRIMARY KEY (id)
);
CREATE TABLE public.consultation_votes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  consultation_id uuid,
  user_id uuid,
  appartement text NOT NULL,
  option_id text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT consultation_votes_pkey PRIMARY KEY (id),
  CONSTRAINT consultation_votes_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
  CONSTRAINT consultation_votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  question text NOT NULL,
  options jsonb NOT NULL,
  statut text DEFAULT 'actif'::text CHECK (statut = ANY (ARRAY['actif'::text, 'termine'::text])),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT consultations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.membres_conseil_syndical (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  batiment text NOT NULL,
  photo_url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT membres_conseil_syndical_pkey PRIMARY KEY (id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  message text NOT NULL,
  link_url text,
  type text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  read_by ARRAY DEFAULT '{}'::uuid[],
  entity_id uuid,
  CONSTRAINT notifications_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  nom text NOT NULL,
  prenom text NOT NULL,
  role USER-DEFINED DEFAULT 'membre'::user_role,
  appartement text,
  batiment text,
  telephone text,
  avatar_url text,
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.syndic (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  fonction text NOT NULL,
  photo_url text,
  telephone_gestionnaire text CHECK (telephone_gestionnaire ~ '^[0-9+ \-\(\)]*$'::text OR telephone_gestionnaire IS NULL),
  email_gestionnaire text CHECK (email_gestionnaire ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text OR email_gestionnaire = ''::text OR email_gestionnaire IS NULL),
  adresse text,
  gestionnaire text,
  assistante text,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  telephone_assistante text CHECK (telephone_assistante ~ '^[0-9+ \-\(\)]*$'::text OR telephone_assistante IS NULL),
  email_assistante text CHECK (email_assistante ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text OR email_assistante = ''::text OR email_assistante IS NULL),
  CONSTRAINT syndic_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  user_name text NOT NULL,
  user_email text NOT NULL,
  action_type text NOT NULL,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  old_data jsonb,
  new_data jsonb,
  CONSTRAINT user_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.vigik_info (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  prix numeric NOT NULL DEFAULT 16.00,
  description text NOT NULL DEFAULT 'Les nouveaux badges sont facturés directement sur vos charges de copropriété. Limite de 4 badges par appartement.'::text,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT vigik_info_pkey PRIMARY KEY (id)
);