"use client";

import { useMessages } from "../../../../lib/hooks/useMessages";
import { MessageBubble } from "../../../../components/messages/MessageBubble";
import { MessageInput } from "../../../../components/messages/MessageInput";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import { useUser } from "../../../../lib/hooks/useUser";
import { Hash, Users, ArrowLeft } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { DEMO_MODE } from "../../../../lib/demo-data";
import { toast } from "../../../../hooks/use-toast";

export default function ChannelPage({ params }: { params: { channelId: string } }) {
    const { messages, canaux, isLoading, mutate } = useMessages(params.channelId);
    const { user } = useUser();
    const scrollRef = useRef<HTMLDivElement>(null);

    const canal = canaux?.find(c => c.id === params.channelId);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            const lastChild = scrollRef.current.lastElementChild;
            if (lastChild) {
                lastChild.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [messages]);

    const handleSend = async (text: string) => {
        if (DEMO_MODE) {
            toast({ title: "Mode Démo", description: "Le message aurait été envoyé." });
            return;
        }
        const supabase = createClient();
        await supabase.from('messages').insert({
            contenu: text,
            auteur_id: user?.id,
            canal_id: params.channelId,
            type: 'texte',
        });
        // Trigger SWR revalidation
        mutate();
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background animate-in slide-in-from-right-2 duration-300">
            {/* Header du canal */}
            <div className="h-16 px-4 sm:px-6 border-b border-border bg-surface flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="md:hidden -ml-2 text-muted-foreground">
                        <Link href="/messages"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h2 className="font-bold text-lg text-primary flex items-center gap-2">
                            <Hash className="h-5 w-5 text-muted-foreground" />
                            {canal?.nom || "Chargement..."}
                        </h2>
                        {canal?.description && (
                            <p className="text-xs text-muted-foreground font-medium hidden sm:block truncate max-w-md">{canal.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-black/5 px-3 py-1.5 rounded-full border border-black/5">
                    <Users className="h-4 w-4" /> 12
                </div>
            </div>

            {/* Zone des messages */}
            <ScrollArea className="flex-1 bg-surface/50 p-4 sm:p-6" viewportRef={scrollRef}>
                <div className="max-w-3xl mx-auto flex flex-col justify-end space-y-4 pb-4">
                    <div className="py-8 text-center bg-surface border border-border shadow-sm rounded-2xl mb-8 max-w-md mx-auto relative overflow-hidden">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary-light"></div>
                        <p className="text-xl font-bold text-primary mb-2">Bienvenue dans #{canal?.nom}</p>
                        <p className="text-sm text-muted-foreground font-medium">Ce canal est dédié à {canal?.description ? canal.description.toLowerCase() : 'ces discussions'}.</p>
                    </div>

                    {messages?.map((message, index) => {
                        const isOwn = message.auteur_id === user?.id;
                        const prevMessage = index > 0 ? messages[index - 1] : null;
                        const showAvatar = !prevMessage || prevMessage.auteur_id !== message.auteur_id;

                        return (
                            <MessageBubble
                                key={message.id}
                                message={message}
                                isOwn={isOwn}
                                showAvatar={showAvatar}
                            />
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="mt-auto shrink-0 bg-surface z-10 border-t border-border shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
                <div className="max-w-4xl mx-auto w-full">
                    <MessageInput canalName={canal?.nom} onSend={handleSend} />
                </div>
            </div>
        </div>
    );
}
