import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";

export interface NotificationItem {
    id: string;
    title: string;
    message: string;
    link_url: string;
    type: string;
    created_at: string;
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (!error && data) {
                setNotifications(data);
            }
            setIsLoading(false);
        };
        fetchNotifications();
    }, []);

    return { notifications, isLoading };
}
