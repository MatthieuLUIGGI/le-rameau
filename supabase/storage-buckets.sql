-- ============================================================
-- Supabase Storage — Buckets pour les médias des actualités
-- À exécuter dans l'éditeur SQL Supabase Dashboard
-- ============================================================

-- 1. Créer les buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('actualites-images', 'actualites-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('actualites-fichiers', 'actualites-fichiers', true, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- 2. Politique : lecture publique pour les images
CREATE POLICY "Images actualités — lecture publique"
ON storage.objects FOR SELECT
USING (bucket_id = 'actualites-images');

-- 3. Politique : upload pour les utilisateurs authentifiés (admin/ag)
CREATE POLICY "Images actualités — upload authentifié"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'actualites-images'
  AND auth.role() = 'authenticated'
);

-- 4. Politique : suppression pour les utilisateurs authentifiés
CREATE POLICY "Images actualités — suppression authentifiée"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'actualites-images'
  AND auth.role() = 'authenticated'
);

-- 5. Politique : lecture publique pour les fichiers
CREATE POLICY "Fichiers actualités — lecture publique"
ON storage.objects FOR SELECT
USING (bucket_id = 'actualites-fichiers');

-- 6. Politique : upload pour les utilisateurs authentifiés
CREATE POLICY "Fichiers actualités — upload authentifié"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'actualites-fichiers'
  AND auth.role() = 'authenticated'
);

-- 7. Politique : suppression pour les utilisateurs authentifiés
CREATE POLICY "Fichiers actualités — suppression authentifiée"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'actualites-fichiers'
  AND auth.role() = 'authenticated'
);