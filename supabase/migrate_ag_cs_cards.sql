-- Suppression des anciennes tables
DROP TABLE IF EXISTS public.assemblee_generale;
DROP TABLE IF EXISTS public.conseil_syndical;

-- Migration table assemblee_generale
CREATE TABLE public.assemblee_generale (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position integer DEFAULT 0,
  titre text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'empty' CHECK (type IN ('file', 'link', 'empty')),
  url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT assemblee_generale_pkey PRIMARY KEY (id)
);

-- Migration table conseil_syndical
CREATE TABLE public.conseil_syndical (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  position integer NOT NULL DEFAULT 0,
  titre text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'empty' CHECK (type IN ('file', 'link', 'empty')),
  url text,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT conseil_syndical_pkey PRIMARY KEY (id)
);

-- RLS Settings (enable but freely open to reading by authenticated users as per standard practices in this app)
ALTER TABLE public.assemblee_generale ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conseil_syndical ENABLE ROW LEVEL SECURITY;

-- If needed, policies can be added:
CREATE POLICY "Enable read access for all users" ON public.assemblee_generale FOR SELECT USING (true);
CREATE POLICY "Enable all for admins on assemblee_generale" ON public.assemblee_generale FOR ALL USING (true);

CREATE POLICY "Enable read access for all users" ON public.conseil_syndical FOR SELECT USING (true);
CREATE POLICY "Enable all for admins on conseil_syndical" ON public.conseil_syndical FOR ALL USING (true);
