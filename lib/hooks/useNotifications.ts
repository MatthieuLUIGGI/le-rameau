import { useEffect, useState, useCallback } from "react";
import { createClient } from "../supabase/client";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    link_url: string;
    type: string;
    created_at: string;
    read_by: string[];
}

export function useNotifications(userId?: string | null) {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) {
            const safeData = data.map(n => ({ ...n, read_by: n.read_by || [] }));
            setNotifications(safeData);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchNotifications();

        const supabase = createClient();
        const subscription = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'notifications' },
                () => {
                    fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [fetchNotifications]);

    const markAsRead = async (notifId: string) => {
        if (!userId) return;
        const notif = notifications.find(n => n.id === notifId);
        if (!notif || notif.read_by.includes(userId)) return;

        const newReadBy = [...notif.read_by, userId];
        setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read_by: newReadBy } : n));

        const supabase = createClient();
        await supabase.from('notifications').update({ read_by: newReadBy }).eq('id', notifId);
    };

    const markAllAsRead = async () => {
        if (!userId) return;

        const unreadIds = notifications.filter(n => !n.read_by.includes(userId)).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({
            ...n,
            read_by: n.read_by.includes(userId) ? n.read_by : [...n.read_by, userId]
        })));

        const supabase = createClient();
        for (const notif of notifications.filter(n => !n.read_by.includes(userId))) {
            await supabase.from('notifications').update({ read_by: [...notif.read_by, userId] }).eq('id', notif.id);
        }
    };

    const unreadCount = userId ? notifications.filter(n => !n.read_by.includes(userId)).length : 0;

    return { notifications, isLoading, unreadCount, markAsRead, markAllAsRead };
}
