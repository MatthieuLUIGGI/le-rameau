import { createClient } from "./supabase/client";

export const createNotification = async (
    title: string,
    message: string,
    link_url: string,
    type: 'actualite' | 'ag' | 'consultation',
    entity_id?: string | null
) => {
    try {
        const supabase = createClient();
        console.log(`[Notification] Saving notification: ${title} (Entity: ${entity_id})`);
        const { error } = await supabase.from('notifications').insert([{
            title,
            message,
            link_url,
            type,
            entity_id: entity_id || null
        }]);

        if (error) {
            console.error("[Notification] Insert error:", error);
        }
    } catch (e) {
        console.error("[Notification] Failed to create notification:", e);
    }
};

export const deleteNotificationByEntity = async (entity_id: string) => {
    try {
        const supabase = createClient();
        const { error } = await supabase.from('notifications').delete().eq('entity_id', entity_id);

        if (error) {
            console.error("[Notification] Delete error:", error);
        }
    } catch (e) {
        console.error("[Notification] Failed to delete notification:", e);
    }
};
