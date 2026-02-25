"use client";

import { MessageSquare } from "lucide-react";
import { ChannelList } from "../../../components/messages/ChannelList";

export default function MessagesIndexPage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black/5 animate-in fade-in duration-500">
            {/* Sur mobile, on affiche la liste des canaux car la sidebar est cachée par défaut */}
            <div className="md:hidden w-full max-w-sm mb-8">
                <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                    <ChannelList />
                </div>
            </div>

            <div className="hidden md:flex flex-col items-center text-center">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6 inline-flex border border-border">
                    <MessageSquare className="h-16 w-16 text-primary/50" />
                </div>
                <h2 className="text-3xl font-extrabold text-primary mb-3">Voisins, voisines !</h2>
                <p className="text-lg text-muted-foreground font-medium max-w-md">Sélectionnez un canal sur la gauche ou commencez une nouvelle discussion privée.</p>
            </div>
        </div>
    );
}
