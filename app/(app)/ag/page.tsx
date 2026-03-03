"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useUser } from "../../../lib/hooks/useUser";
import { Loader2, FileText, ExternalLink, Calendar as CalendarIcon, FileCheck, Link as LinkIcon, Plus } from "lucide-react";
import { Input } from "../../../components/ui/input";
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
        return (
            <div className={`bg-surface border shadow-sm rounded-xl p-5 flex flex-col gap-3 relative hover:shadow-md transition-all ${(box.type === 'link' || box.type === 'file') && box.url ? 'hover:border-primary/50 group' : ''} ${box.type === 'empty' ? 'border-dashed border-border/50 bg-muted/5 opacity-50 min-h-[100px] justify-center items-center' : ''}`}>
                <div className="space-y-1">
                    <h3 className={`font-bold text-lg leading-tight transition-colors ${(box.type === 'link' || box.type === 'file') && box.url ? 'group-hover:text-primary' : 'text-foreground'} ${box.type === 'empty' ? 'text-muted-foreground text-center' : ''}`}>
                        {box.titre || "Sans titre"}
                        {box.type === 'empty' && !box.titre && "En attente de document"}
                        {box.type === 'empty' && box.titre && " (En attente de document)"}
                    </h3>
                    {box.date && (
                        <div className="flex items-center text-sm text-muted-foreground font-medium gap-1.5 pt-1">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(box.date), "dd MMMM yyyy", { locale: fr })}
                        </div>
                    )}
                </div>

                {box.type === 'file' && box.url && (
                    <div className="mt-auto pt-2">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-blue-100">
                            <FileCheck className="w-5 h-5" /> Ouvrir le document
                        </div>
                    </div>
                )}

                {box.type === 'link' && box.url && (
                    <div className="mt-auto pt-2">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-primary/20">
                            <ExternalLink className="w-5 h-5" /> Consulter le lien
                        </div>
                    </div>
                )}

                {(box.type === 'link' || box.type === 'file') && box.url && <a href={box.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10 w-full h-full cursor-pointer"></a>}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
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
