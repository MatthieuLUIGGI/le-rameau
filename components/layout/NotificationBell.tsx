"use client";

import { Bell } from "lucide-react";
import { useMessages } from "../../lib/hooks/useMessages";
import { useAlertes } from "../../lib/hooks/useAlertes";
import { Button } from "../ui/button";

export function NotificationBell() {
    const { messages } = useMessages();
    const { alertes } = useAlertes();

    const unreadMessagesCount = messages?.filter(m => !m.is_read).length || 0;
    const activeAlertsCount = alertes?.filter(a => a.statut === 'en_cours').length || 0;

    const totalCount = unreadMessagesCount + activeAlertsCount;

    return (
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
            <Bell className="h-5 w-5" />
            {totalCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                    {totalCount > 9 ? '9+' : totalCount}
                </span>
            )}
        </Button>
    );
}
