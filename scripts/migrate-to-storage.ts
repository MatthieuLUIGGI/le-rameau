/**
 * Script de migration : base64 → Supabase Storage
 *
 * Migre les images et fichiers stockés en base64 dans la table `actualites`
 * vers les buckets Supabase Storage (`actualites-images` et `actualites-fichiers`).
 *
 * Usage :
 *   npx ts-node --project tsconfig.json scripts/migrate-to-storage.ts
 *
 * Prérequis :
 *   - Les buckets doivent exister (exécuter supabase/storage-buckets.sql d'abord)
 *   - Les variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être dans .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Chargement des variables d'environnement depuis .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx > 0) {
                const key = trimmed.substring(0, eqIdx).trim();
                const val = trimmed.substring(eqIdx + 1).trim().replace(/^"|"$/g, '');
                if (!process.env[key]) process.env[key] = val;
            }
        }
    });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises dans .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

type ActualiteRow = {
    id: string;
    titre: string;
    image_url: string | null;
    pdf_url: string | null;
};

/**
 * Convertit une string base64 en Buffer
 */
function base64ToBuffer(base64: string): { buffer: Buffer; mimeType: string } {
    const [prefix, data] = base64.split(',');
    const mimeMatch = prefix.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    return {
        buffer: Buffer.from(data, 'base64'),
        mimeType,
    };
}

/**
 * Détermine l'extension depuis le mime type
 */
function mimeToExtension(mime: string): string {
    const map: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };
    return map[mime] ?? 'bin';
}

/**
 * Upload un buffer vers Storage et retourne l'URL publique
 */
async function uploadToStorage(
    buffer: Buffer,
    mimeType: string,
    bucket: string,
    prefix: string
): Promise<string> {
    const ext = mimeToExtension(mimeType);
    const fileName = `migrated-${prefix}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, { contentType: mimeType, upsert: false });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return publicUrl;
}

async function main() {
    console.log('🚀 Démarrage de la migration base64 → Supabase Storage...\n');

    // Récupérer toutes les actualités avec des données base64
    const { data: rows, error } = await supabase
        .from('actualites')
        .select('id, titre, image_url, pdf_url');

    if (error) {
        console.error('❌ Erreur lecture actualités:', error.message);
        process.exit(1);
    }

    const actualites = (rows as ActualiteRow[]).filter(
        r => (r.image_url?.startsWith('data:')) || (r.pdf_url?.startsWith('data:'))
    );

    if (actualites.length === 0) {
        console.log('✅ Aucune donnée base64 trouvée. Migration non nécessaire.');
        return;
    }

    console.log(`📋 ${actualites.length} actualité(s) à migrer...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const actualite of actualites) {
        console.log(`🔄 [${actualite.id}] "${actualite.titre}"`);

        const updates: Partial<ActualiteRow> = {};

        // Migrer l'image
        if (actualite.image_url?.startsWith('data:')) {
            try {
                const { buffer, mimeType } = base64ToBuffer(actualite.image_url);
                const url = await uploadToStorage(buffer, mimeType, 'actualites-images', actualite.id);
                updates.image_url = url;
                console.log(`  ✅ Image migrée → ${url.substring(0, 60)}...`);
            } catch (e) {
                console.error(`  ❌ Erreur image: ${e instanceof Error ? e.message : e}`);
                errorCount++;
            }
        }

        // Migrer le fichier PDF/document
        if (actualite.pdf_url?.startsWith('data:')) {
            try {
                const { buffer, mimeType } = base64ToBuffer(actualite.pdf_url);
                const url = await uploadToStorage(buffer, mimeType, 'actualites-fichiers', actualite.id);
                updates.pdf_url = url;
                console.log(`  ✅ Fichier migré → ${url.substring(0, 60)}...`);
            } catch (e) {
                console.error(`  ❌ Erreur fichier: ${e instanceof Error ? e.message : e}`);
                errorCount++;
            }
        }

        // Mettre à jour la ligne en base
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('actualites')
                .update(updates)
                .eq('id', actualite.id);

            if (updateError) {
                console.error(`  ❌ Erreur mise à jour DB: ${updateError.message}`);
                errorCount++;
            } else {
                successCount++;
            }
        }
    }

    console.log(`\n✅ Migration terminée : ${successCount} succès, ${errorCount} erreur(s).`);
    if (errorCount > 0) {
        console.log('⚠️  Vérifiez les erreurs ci-dessus et relancez pour les entrées échouées.');
    }
}

main().catch(e => {
    console.error('❌ Erreur critique:', e);
    process.exit(1);
});
