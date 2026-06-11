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
const envPath = path.resolve(process.cwd(), '.env.local');
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

type DocRow = {
    id: string;
    titre: string;
    url: string | null;
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

    let successCount = 0;
    let errorCount = 0;

    console.log('\n--- 1. MIGRATION DES ACTUALITÉS ---');
    // Récupérer toutes les actualités avec des données base64
    const { data: rowsActu, error: errActu } = await supabase
        .from('actualites')
        .select('id, titre, image_url, pdf_url');

    if (errActu) {
        console.error('❌ Erreur lecture actualités:', errActu.message);
    } else {
        const actualites = (rowsActu as ActualiteRow[]).filter(
            r => (r.image_url?.startsWith('data:')) || (r.pdf_url?.startsWith('data:'))
        );

        if (actualites.length === 0) {
            console.log('✅ Aucune donnée base64 trouvée dans actualites.');
        } else {
            console.log(`📋 ${actualites.length} actualité(s) à migrer...`);
            for (const actualite of actualites) {
                console.log(`🔄 [${actualite.id}] "${actualite.titre}"`);
                const updates: Partial<ActualiteRow> = {};

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

                if (Object.keys(updates).length > 0) {
                    const { error: updateError } = await supabase.from('actualites').update(updates).eq('id', actualite.id);
                    if (updateError) {
                        console.error(`  ❌ Erreur mise à jour DB: ${updateError.message}`);
                        errorCount++;
                    } else {
                        successCount++;
                    }
                }
            }
        }
    }

    console.log('\n--- 2. MIGRATION ASSEMBLÉE GÉNÉRALE ---');
    const { data: rowsAg, error: errAg } = await supabase.from('assemblee_generale').select('id, titre, url');
    if (errAg) {
        console.error('❌ Erreur lecture assemblee_generale:', errAg.message);
    } else {
        const agDocs = (rowsAg as DocRow[]).filter(r => r.url?.startsWith('data:'));
        if (agDocs.length === 0) {
            console.log('✅ Aucune donnée base64 trouvée dans assemblee_generale.');
        } else {
            console.log(`📋 ${agDocs.length} document(s) AG à migrer...`);
            for (const doc of agDocs) {
                console.log(`🔄 [${doc.id}] "${doc.titre}"`);
                try {
                    const { buffer, mimeType } = base64ToBuffer(doc.url!);
                    const uploadedUrl = await uploadToStorage(buffer, mimeType, 'ag-fichiers', doc.id);
                    const { error: upErr } = await supabase.from('assemblee_generale').update({ url: uploadedUrl }).eq('id', doc.id);
                    if (upErr) throw upErr;
                    console.log(`  ✅ PDF migré → ${uploadedUrl.substring(0, 60)}...`);
                    successCount++;
                } catch (e) {
                    console.error(`  ❌ Erreur: ${e instanceof Error ? e.message : e}`);
                    errorCount++;
                }
            }
        }
    }

    console.log('\n--- 3. MIGRATION CONSEIL SYNDICAL ---');
    const { data: rowsCs, error: errCs } = await supabase.from('conseil_syndical').select('id, titre, url');
    if (errCs) {
        console.error('❌ Erreur lecture conseil_syndical:', errCs.message);
    } else {
        const csDocs = (rowsCs as DocRow[]).filter(r => r.url?.startsWith('data:'));
        if (csDocs.length === 0) {
            console.log('✅ Aucune donnée base64 trouvée dans conseil_syndical.');
        } else {
            console.log(`📋 ${csDocs.length} document(s) CS à migrer...`);
            for (const doc of csDocs) {
                console.log(`🔄 [${doc.id}] "${doc.titre}"`);
                try {
                    const { buffer, mimeType } = base64ToBuffer(doc.url!);
                    const uploadedUrl = await uploadToStorage(buffer, mimeType, 'cs-fichiers', doc.id);
                    const { error: upErr } = await supabase.from('conseil_syndical').update({ url: uploadedUrl }).eq('id', doc.id);
                    if (upErr) throw upErr;
                    console.log(`  ✅ PDF migré → ${uploadedUrl.substring(0, 60)}...`);
                    successCount++;
                } catch (e) {
                    console.error(`  ❌ Erreur: ${e instanceof Error ? e.message : e}`);
                    errorCount++;
                }
            }
        }
    }

    console.log(`\n✅ Migration terminée : ${successCount} éléments migrés avec succès, ${errorCount} erreur(s).`);
    if (errorCount > 0) {
        console.log('⚠️  Vérifiez les erreurs ci-dessus et relancez pour les entrées échouées.');
    }
}

main().catch(e => {
    console.error('❌ Erreur critique:', e);
    process.exit(1);
});
