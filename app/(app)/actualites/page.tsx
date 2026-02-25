"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { FileText, Loader2, Calendar, AlertCircle, FileDown, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { useUser } from "../../../lib/hooks/useUser";

interface Actualite {
    id: string;
    titre: string;
    extrait: string;
    image_url: string | null;
    pdf_url: string | null;
    priorite: 'basse' | 'normale' | 'haute';
    created_at: string;
    date_expiration: string | null;
}

const mapPrioriteToColor = (priorite: string) => {
    switch (priorite) {
        case 'haute': return 'bg-danger text-danger-foreground';
        case 'normale': return 'bg-primary text-primary-foreground';
        case 'basse': return 'bg-muted text-muted-foreground border border-border';
        default: return 'bg-primary text-primary-foreground';
    }
};

const mapPrioriteToLabel = (priorite: string) => {
    switch (priorite) {
        case 'haute': return 'Important';
        case 'normale': return 'Info';
        case 'basse': return 'Secondaire';
        default: return 'Info';
    }
};

export default function ActualitesList() {
    const { user } = useUser();
    const [actualites, setActualites] = useState<Actualite[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchActualites = async () => {
            const supabase = createClient();

            let query = supabase.from('actualites').select('*').order('created_at', { ascending: false });

            // Filtre : ne pas récupérer les actualités expirées pour les résidents, mais l'admin (`ag`) les verra.
            if (user?.role !== 'ag') {
                const now = new Date().toISOString();
                query = query.or(`date_expiration.is.null,date_expiration.gt.${now}`);
            }

            const { data } = await query;
            if (data) {
                const sortedData = (data as Actualite[]).sort((a, b) => {
                    if (a.priorite === 'haute' && b.priorite !== 'haute') return -1;
                    if (b.priorite === 'haute' && a.priorite !== 'haute') return 1;
                    return 0;
                });
                setActualites(sortedData);
            }
            setIsLoading(false);
        };

        // Si on connait pas encore le rôle du user, on attend qu'il charge (puisqu'on filtre côté client vs db policy). 
        if (user !== undefined) fetchActualites();

    }, [user]);

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary mb-2 flex items-center gap-3">
                        Actualités <span className="p-1 px-3 bg-primary/10 text-primary text-sm rounded-full align-middle">Beta</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Restez informé(e) des dernières nouveautés et interventions dans votre résidence.
                    </p>
                </div>
                {user?.role === 'ag' && (
                    <Button asChild className="font-bold">
                        <Link href="/dashboard/actualites/create">
                            <Plus className="w-4 h-4 mr-2" />
                            Publier une annonce
                        </Link>
                    </Button>
                )}
            </div>

            {actualites.length === 0 ? (
                <div className="text-center p-12 bg-surface border-2 border-dashed border-border rounded-xl">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground font-medium text-lg">Aucune actualité pour le moment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {actualites.map((actu) => {
                        const isExpired = actu.date_expiration && new Date(actu.date_expiration) < new Date();
                        const isImportant = actu.priorite === 'haute' && !isExpired;

                        return (
                            <Link href={`/actualites/${actu.id}`} key={actu.id} className="block group h-full">
                                <Card className={`bg-surface border-border shadow-sm transition-all duration-500 cursor-pointer h-full relative overflow-hidden flex flex-col ${isExpired ? 'opacity-50 grayscale' : ''} ${isImportant ? 'border-danger/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.3)] group-hover:border-danger scale-[1.02] group-hover:scale-[1.04]' : 'group-hover:shadow-md group-hover:border-primary/50'}`}>
                                    {isImportant && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger/50 via-danger to-danger/50 animate-pulse z-20"></div>}

                                    {actu.image_url ? (
                                        <div className="w-full h-48 bg-muted relative overflow-hidden shrink-0">
                                            <img src={actu.image_url} alt={actu.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {isExpired && <div className="absolute inset-0 bg-background/50 flex items-center justify-center font-bold uppercase tracking-widest text-background backdrop-blur-sm">Expirée</div>}
                                        </div>
                                    ) : (
                                        <div className="w-full h-12 shrink-0"></div>
                                    )}

                                    <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 flex items-center gap-1 ${mapPrioriteToColor(actu.priorite)} ${isImportant ? 'animate-pulse' : ''}`}>
                                        {isImportant && <AlertCircle className="w-3 h-3" />}
                                        {mapPrioriteToLabel(actu.priorite)}
                                    </div>

                                    <CardHeader className="pb-2 pt-4 flex-1">
                                        <div className="flex items-center text-xs text-muted-foreground font-medium mb-3 gap-1.5 flex-wrap">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(actu.created_at), "d MMMM yyyy", { locale: fr })}
                                            {actu.pdf_url && (
                                                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md border border-border">
                                                    <FileDown className="w-3" /> PDF joint
                                                </span>
                                            )}
                                        </div>

                                        <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                            {actu.titre}
                                        </CardTitle>
                                        <CardDescription className="pt-3 line-clamp-3 text-sm text-foreground/80 font-medium">
                                            {actu.extrait}
                                        </CardDescription>
                                    </CardHeader>

                                    <div className="p-6 pt-0 mt-auto">
                                        <div className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                                            Lire la suite <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
