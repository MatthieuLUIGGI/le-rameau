"use client";

import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useNotifications } from "../../lib/hooks/useNotifications";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";

export function NotificationBell() {
    const { notifications } = useNotifications();

    const unreadCount = notifications.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 border-border bg-surface text-foreground z-50 shadow-lg">
                <DropdownMenuLabel className="font-bold flex justify-between items-center py-3 px-4 text-primary">
                    <span>Notifications récentes</span>
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{notifications.length}</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            Aucune notification
                        </div>
                    ) : (
                        notifications.map((notif) => (
                            <DropdownMenuItem key={notif.id} className="cursor-pointer p-0" asChild>
                                <Link href={notif.link_url} className="flex flex-col p-4 border-b border-border/50 outline-none hover:bg-muted/50 focus:bg-muted/50 transition-colors">
                                    <div className="flex justify-between items-start w-full">
                                        <span className="font-bold text-sm truncate pr-2">{notif.title}</span>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
                                            {format(new Date(notif.created_at), "dd MMM HH:mm", { locale: fr })}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground line-clamp-2 mt-1">{notif.message}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
