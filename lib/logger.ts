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
        const { error } = await supabase.from('user_logs').insert([{
            user_id: userId,
            user_name: userName,
            user_email: userEmail,
            action_type,
            details: details || null,
            old_data: old_data || null,
            new_data: new_data || null
        }]);

        if (error) {
            console.error("[Logger] Insert error:", error);
        }
    } catch (e) {
        console.error("[Logger] Failed to log action:", e);
    }
};
