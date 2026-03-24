CREATE TABLE IF NOT EXISTS public.spline_message (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message text NOT NULL DEFAULT 'Bienvenue sur le site de la Copropriété',
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT spline_message_pkey PRIMARY KEY (id)
);

-- Insertion de la ligne par défaut
INSERT INTO public.spline_message (id, message, is_active) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Bienvenue sur le site de la Copropriété', true)
ON CONFLICT (id) DO NOTHING;

-- Configuration de la sécurité
ALTER TABLE public.spline_message ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all" ON public.spline_message FOR SELECT USING (true);
CREATE POLICY "Enable update for admins" ON public.spline_message FOR UPDATE USING (auth.role() = 'authenticated');
