"use client";

import { useMessages } from "../../lib/hooks/useMessages";
import { cn } from "../../lib/utils";
import { Hash, Plus, Settings } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "../ui/badge";
import { useUser } from "../../lib/hooks/useUser";

export function ChannelList() {
    const { canaux, messages, isLoading } = useMessages();
    const { user } = useUser();
    const pathname = usePathname();

    const getUnreadCount = (canalId: string) => {
        return messages?.filter(m => m.canal_id === canalId && !m.is_read).length || 0;
    };

    const currentCanalId = pathname.split('/').pop();

    return (
        <div className="h-full flex flex-col bg-slate-50 border-r border-border min-w-[280px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface">
                <h2 className="font-bold text-lg text-primary">Discussions</h2>
            </div>

            <ScrollArea className="flex-1 px-3 py-4">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2 px-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                            Canaux
                            {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full hover:bg-black/10">
                                    <Plus className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                        {isLoading ? (
                            <div className="space-y-2 px-2">
                                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-black/5 rounded-md animate-pulse"></div>)}
                            </div>
                        ) : (
                            canaux?.filter(c => !c.is_private).map((canal) => {
                                const isActive = currentCanalId === canal.id || (pathname === '/messages' && canal.nom === 'Général');
                                const unreadCount = getUnreadCount(canal.id);
                                return (
                                    <Link
                                        key={canal.id}
                                        href={`/messages/${canal.id}`}
                                        className={cn(
                                            "flex items-center justify-between px-2 py-1.5 rounded-lg text-sm mb-1 transition-colors",
                                            isActive
                                                ? "bg-primary text-white font-medium"
                                                : "text-foreground hover:bg-black/5"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Hash className={cn("h-4 w-4 shrink-0", isActive ? "text-white/70" : "text-muted-foreground")} />
                                            <span className="truncate">{canal.nom}</span>
                                        </div>
                                        {unreadCount > 0 && !isActive && (
                                            <Badge className="bg-primary hover:bg-primary text-[10px] w-5 h-5 flex items-center justify-center p-0 rounded-full">
                                                {unreadCount}
                                            </Badge>
                                        )}
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
