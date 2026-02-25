CREATE TABLE IF NOT EXISTS public.assemblee_generale (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position INTEGER DEFAULT 0,
    pv_titre TEXT,
    pv_date TEXT,
    pv_type TEXT,
    pv_url TEXT,
    rapport_titre TEXT,
    rapport_date TEXT,
    rapport_type TEXT,
    rapport_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Désactivation de la sécurité RLS pour accès non-bloqué
ALTER TABLE public.assemblee_generale DISABLE ROW LEVEL SECURITY;

-- Création du bucket de stockage pour les documents de l'AG
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ag_docs', 'ag_docs', true)
ON CONFLICT (id) DO NOTHING;
