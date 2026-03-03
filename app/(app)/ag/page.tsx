"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useUser } from "../../../lib/hooks/useUser";
import { Loader2, FileText, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DocCard {
    id: string;
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
    position: number;
}

export default function AGPage() {
    const { user, isLoading: userLoading } = useUser();
    const [cards, setCards] = useState<DocCard[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    useEffect(() => {
        if (!userLoading && user) {
            fetchDocuments();
        } else if (!userLoading && !user) {
            setIsLoadingDocs(false);
        }
    }, [user, userLoading]);

    const fetchDocuments = async () => {
        setIsLoadingDocs(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('assemblee_generale').select('*').order('position', { ascending: true });

        if (data && data.length > 0) {
            setCards(data as DocCard[]);
        }
        setIsLoadingDocs(false);
    };

    if (userLoading || isLoadingDocs) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    const DocumentCard = ({ box }: { box: DocCard }) => {
        if (box.type === 'empty') {
            return (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5 opacity-50 min-h-[160px]">
                    <span className="text-sm font-medium text-muted-foreground">{box.titre || "En attente"}</span>
                </div>
            );
        }

        const isLink = box.type === 'link';

        return (
            <a
                href={box.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-surface hover:bg-muted/30 border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden min-h-[160px]"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {isLink ? <ExternalLink className="w-16 h-16 -mt-2 -mr-2 text-primary" /> : <FileText className="w-16 h-16 -mt-2 -mr-2 text-primary" />}
                </div>

                <div className="bg-primary/10 w-12 h-12 flex items-center justify-center text-primary rounded-xl mb-1">
                    {isLink ? <ExternalLink className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>

                <div className="space-y-1 relative z-10 w-full mt-auto">
                    <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                        {box.titre || "Document sans titre"}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground font-medium gap-1.5 pt-1">
                        <CalendarIcon className="w-4 h-4" />
                        {box.date ? format(new Date(box.date), "dd MMMM yyyy", { locale: fr }) : "Date non spécifiée"}
                    </div>
                </div>
            </a>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-border mt-6 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-primary to-blue-500"></div>
                <h1 className="text-3xl font-extrabold text-foreground mb-4">Assemblée Générale</h1>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
                    Retrouvez ici l'ensemble des documents concernant l'Assemblée Générale.
                </p>
            </div>

            {cards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-medium bg-surface rounded-2xl border border-border border-dashed">
                    Aucun document n'a été publié pour le moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map((card) => (
                        <DocumentCard key={card.id} box={card} />
                    ))}
                </div>
            )}
        </div>
    );
}
