-- CRÉATION DES BUCKETS POUR ASSEMBLÉE GÉNÉRALE ET CONSEIL SYNDICAL

-- 1. Création du bucket pour l'Assemblée Générale
INSERT INTO storage.buckets (id, name, public)
VALUES ('ag-fichiers', 'ag-fichiers', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Création du bucket pour le Conseil Syndical
INSERT INTO storage.buckets (id, name, public)
VALUES ('cs-fichiers', 'cs-fichiers', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Politiques pour Assemblée Générale (Lecture publique, upload authentifié)
CREATE POLICY "Fichiers AG — lecture publique"
ON storage.objects FOR SELECT
USING (bucket_id = 'ag-fichiers');

CREATE POLICY "Fichiers AG — upload authentifié"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ag-fichiers' AND auth.role() = 'authenticated');

CREATE POLICY "Fichiers AG — suppression authentifiée"
ON storage.objects FOR DELETE
USING (bucket_id = 'ag-fichiers' AND auth.role() = 'authenticated');

-- 4. Politiques pour Conseil Syndical (Lecture publique, upload authentifié)
CREATE POLICY "Fichiers CS — lecture publique"
ON storage.objects FOR SELECT
USING (bucket_id = 'cs-fichiers');

CREATE POLICY "Fichiers CS — upload authentifié"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cs-fichiers' AND auth.role() = 'authenticated');

CREATE POLICY "Fichiers CS — suppression authentifiée"
ON storage.objects FOR DELETE
USING (bucket_id = 'cs-fichiers' AND auth.role() = 'authenticated');
