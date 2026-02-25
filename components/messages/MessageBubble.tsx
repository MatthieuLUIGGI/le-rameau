"use client";

import { Message } from "../../types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "../../lib/utils";

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
    showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
    return (
        <div className={cn("flex flex-col mb-4", isOwn ? "items-end" : "items-start")}>
            <div className={cn("flex max-w-[80%] md:max-w-[70%] gap-3", showAvatar ? "mt-4" : "mt-1", isOwn ? "flex-row-reverse" : "flex-row")}>

                {/* Avatar Placeholder / Spacing */}
                <div className="shrink-0 w-10">
                    {showAvatar ? (
                        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                            <AvatarImage src={message.auteur?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                {message.auteur?.prenom[0]}{message.auteur?.nom[0]}
                            </AvatarFallback>
                        </Avatar>
                    ) : null}
                </div>

                <div className={cn("flex flex-col min-w-0", isOwn ? "items-end" : "items-start")}>
                    {showAvatar && (
                        <div className="flex items-baseline gap-2 mb-1 px-1">
                            <span className="text-sm font-semibold text-foreground">
                                {isOwn ? "Vous" : `${message.auteur?.prenom} ${message.auteur?.nom}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {format(new Date(message.created_at), "HH:mm", { locale: fr })}
                            </span>
                        </div>
                    )}

                    <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm/relaxed shadow-sm break-words relative",
                        isOwn
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-surface border border-border/40 text-foreground rounded-tl-none"
                    )}>
                        {message.contenu}
                    </div>
                </div>
            </div>
        </div>
    );
}
