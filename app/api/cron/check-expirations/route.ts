import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Ce cron est conçu pour être appelé de manière sécurisée (par exemple via Vercel Cron ou pg_cron)
export async function GET(request: Request) {
    // Vérification éventuelle d'un token d'autorisation
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Utiliser le client admin pour contourner le RLS
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        const now = new Date().toISOString();
        
        // Trouver toutes les actualités expirées
        const { data: expired, error } = await supabaseAdmin
            .from('actualites')
            .select('id, titre')
            .not('date_expiration', 'is', null)
            .lt('date_expiration', now);

        if (error) {
            console.error("Erreur lors de la récupération des actualités expirées :", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (expired && expired.length > 0) {
            const expiredIds = expired.map(e => e.id);

            // 1. Supprimer les notifications liées à ces actualités
            await supabaseAdmin.from('notifications').delete().in('entity_id', expiredIds);

            // 2. Journaliser l'expiration (une seule fois par actualité)
            const { data: existingLogs } = await supabaseAdmin
                .from('user_logs')
                .select('details')
                .eq('action_type', 'Expiration');

            const existingDetails = new Set(existingLogs?.map(l => l.details) || []);

            const logsToInsert = expired
                .filter(e => !existingDetails.has(`A expiré l'actualité: ${e.titre}`))
                .map(e => ({
                    user_id: null,
                    user_name: 'Système',
                    user_email: 'robot@system.fr',
                    action_type: 'Expiration',
                    details: `A expiré l'actualité: ${e.titre}`,
                    old_data: e,
                    new_data: null
                }));

            if (logsToInsert.length > 0) {
                const { error: logError } = await supabaseAdmin.from('user_logs').insert(logsToInsert);
                if (logError) {
                    console.error("Erreur d'insertion des logs:", logError);
                }
            }

            return NextResponse.json({ success: true, processed: expiredIds.length, logsInserted: logsToInsert.length });
        }

        return NextResponse.json({ success: true, processed: 0, logsInserted: 0 });

    } catch (e: any) {
        console.error("Exception in check-expirations:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
