import { createClient } from "./supabase/client";

export const createNotification = async (
    title: string,
    message: string,
    link_url: string,
    type: 'actualite' | 'ag' | 'consultation'
) => {
    try {
        const supabase = createClient();
        console.log(`[Notification] Saving notification: ${title}`);
        const { error } = await supabase.from('notifications').insert([{
            title,
            message,
            link_url,
            type
        }]);

        if (error) {
            console.error("[Notification] Insert error:", error);
        }
    } catch (e) {
        console.error("[Notification] Failed to create notification:", e);
    }
};
