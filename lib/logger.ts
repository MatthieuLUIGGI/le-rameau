import { createClient } from "./supabase/client";

export type ActionType = 'Connexion' | 'Déconnexion' | 'Création' | 'Modification' | 'Suppression';

export const logAction = async (
    action_type: ActionType,
    userId: string | null,
    userName: string,
    userEmail: string,
    details?: string,
    old_data?: any,
    new_data?: any
) => {
    try {
        const supabase = createClient();
        console.log(`[Logger] Saving ${action_type} for ${userEmail}...`);

        // Fonction pour nettoyer les données lourdes (ex: images base64)
        const sanitizeData = (data: any) => {
            if (!data) return data;
            const clean = { ...data };
            const keysToTruncate = ['image_url', 'pdf_url', 'url', 'photo_url', 'contenu'];
            for (const key of keysToTruncate) {
                if (clean[key] && typeof clean[key] === 'string' && clean[key].length > 500) {
                    clean[key] = clean[key].substring(0, 100) + '... [TRONQUÉ]';
                }
            }
            return clean;
        };

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
