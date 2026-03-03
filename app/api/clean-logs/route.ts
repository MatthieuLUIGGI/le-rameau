import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: logs, error } = await supabase.from('user_logs').select('id, old_data, new_data');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        let updatedCount = 0;
        let deletedCount = 0;

        for (const log of logs) {
            let needsUpdate = false;
            let cleanOld = { ...log.old_data };
            let cleanNew = { ...log.new_data };

            const checkAndTruncate = (obj: any) => {
                let changed = false;
                if (!obj || typeof obj !== 'object') return false;
                for (const key of ['image_url', 'pdf_url', 'url', 'photo_url', 'contenu']) {
                    if (obj[key] && typeof obj[key] === 'string' && obj[key].length > 500) {
                        obj[key] = obj[key].substring(0, 100) + '... [TRONQUÉ API]';
                        changed = true;
                    }
                }
                return changed;
            };

            if (checkAndTruncate(cleanOld)) needsUpdate = true;
            if (checkAndTruncate(cleanNew)) needsUpdate = true;

            if (needsUpdate) {
                // Try to update, but if it fails due to too large, we might just delete it.
                const { error: upErr } = await supabase.from('user_logs').update({ old_data: cleanOld, new_data: cleanNew }).eq('id', log.id);
                if (upErr) {
                    await supabase.from('user_logs').delete().eq('id', log.id);
                    deletedCount++;
                } else {
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, updatedCount, deletedCount, totalLogs: logs.length });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
