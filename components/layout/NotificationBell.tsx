"use client";

import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useNotifications } from "../../lib/hooks/useNotifications";
import { useUser } from "../../lib/hooks/useUser";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";

export function NotificationBell() {
    const { user } = useUser();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id);

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
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); markAllAsRead(); }} className="h-auto px-2 py-1 text-xs hover:text-primary/80">
                            <CheckCheck className="h-3 w-3 mr-1" /> Tout marquer comme lu
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground italic flex flex-col items-center gap-2">
                            <Bell className="w-8 h-8 opacity-20" />
                            Aucune notification
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const isUnread = user?.id && !notif.read_by.includes(user.id);

                            return (
                                <DropdownMenuItem key={notif.id} className="cursor-pointer p-0" asChild>
                                    <Link
                                        href={notif.link_url}
                                        onClick={() => markAsRead(notif.id)}
                                        className={cn(
                                            "flex flex-col p-4 border-b border-border/50 outline-none transition-colors",
                                            isUnread ? "bg-primary/5 hover:bg-primary/10 focus:bg-primary/10" : "hover:bg-muted/50 focus:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start w-full gap-2">
                                            <span className={cn(
                                                "text-sm truncate pr-2",
                                                isUnread ? "font-bold text-primary" : "font-semibold text-foreground"
                                            )}>{notif.title}</span>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap font-medium flex-shrink-0">
                                                {format(new Date(notif.created_at), "dd MMM HH:mm", { locale: fr })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center w-full mt-1">
                                            <span className="text-xs text-muted-foreground line-clamp-2">{notif.message}</span>
                                            {isUnread && <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />}
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
