import { createClient } from "./supabase/client";

export type ActionType = 'Connexion' | 'Déconnexion' | 'Création' | 'Modification' | 'Suppression' | 'Expiration';

/** Nettoie les données lourdes (base64, contenu long) avant stockage dans les logs */
export const sanitizeData = (
    data: unknown
): Record<string, unknown> | null | undefined => {
    if (!data || typeof data !== 'object') return data as null | undefined;
    const clean = { ...(data as Record<string, unknown>) };
    const keysToTruncate = ['image_url', 'pdf_url', 'url', 'photo_url', 'contenu'];
    for (const key of keysToTruncate) {
        const val = clean[key];
        if (typeof val === 'string' && val.length > 500) {
            clean[key] = val.substring(0, 100) + '... [TRONQUÉ]';
        }
    }
    return clean;
};

export const logAction = async (
    action_type: ActionType,
    userId: string | null,
    userName: string,
    userEmail: string,
    details?: string,
    old_data?: unknown,
    new_data?: unknown
) => {
    try {
        const supabase = createClient();
        console.log(`[Logger] Saving ${action_type} for ${userEmail}...`);

        const { error } = await supabase.from('user_logs').insert([{
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            action_type,
            details: details || null,
            old_data: sanitizeData(old_data) || null,
            new_data: sanitizeData(new_data) || null
        }]);

        if (error) {
            console.error("[Logger] Insert error:", error);
        }
    } catch (e) {
        console.error("[Logger] Failed to log action:", e);
    }
};
