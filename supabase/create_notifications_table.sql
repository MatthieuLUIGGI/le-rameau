-- Création de la table 'notifications'
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Désactivation du RLS ou création d'une police ouverte
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acces public lecture notifications"
ON public.notifications FOR SELECT
USING (true);

CREATE POLICY "Acces public insertion notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Acces public suppression notifications"
ON public.notifications FOR DELETE
USING (true);
