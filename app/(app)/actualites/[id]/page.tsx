"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2, Calendar, FileDown, ArrowLeft, ArrowRight, User } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import Link from "next/link";
import { useParams, redirect } from "next/navigation";
import { Card } from "../../../../components/ui/card";
import { useUser } from "../../../../lib/hooks/useUser";

interface Actualite {
    id: string;
    titre: string;
    extrait: string;
    contenu: string;
    image_url: string | null;
    pdf_url: string | null;
    priorite: 'basse' | 'normale' | 'haute';
    created_at: string;
    date_expiration: string | null;
}

const mapPrioriteToColor = (priorite: string) => {
    switch (priorite) {
        case 'haute': return 'bg-danger text-danger-foreground text-xs';
        case 'normale': return 'bg-primary text-primary-foreground text-xs';
        case 'basse': return 'bg-muted text-muted-foreground border border-border text-xs';
        default: return 'bg-primary text-primary-foreground text-xs';
    }
};

const mapPrioriteToLabel = (priorite: string) => {
    switch (priorite) {
        case 'haute': return 'Important';
        case 'normale': return 'Information';
        case 'basse': return 'Secondaire';
        default: return 'Information';
    }
};

export default function ActualitePage() {
    const params = useParams();
    const id = params.id as string;
    const { user, isLoading: userLoading } = useUser();
    const [actu, setActu] = useState<Actualite | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const fetchActualite = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('actualites').select('*').eq('id', id).single();

            if (error || !data) {
                redirect("/actualites");
            } else {
                setActu(data as Actualite);
            }
            setIsLoading(false);
        };

        if (!userLoading) fetchActualite();
    }, [id, userLoading]);

    if (userLoading || isLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
    if (!actu) return null;

    const isExpired = actu.date_expiration && new Date(actu.date_expiration) < new Date();

    return (
        <article className="max-w-4xl mx-auto space-y-8 pb-20 pt-6 px-4">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/actualites"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider ${mapPrioriteToColor(actu.priorite)}`}>
                        {mapPrioriteToLabel(actu.priorite)}
                    </span>
                    {isExpired && (
                        <span className="bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider flex justify-center items-center gap-1">
                            Expirée
                        </span>
                    )}
                </div>
            </div>

            <div className={`space-y-8 ${isExpired && user?.role !== 'ag' ? 'opacity-50' : ''}`}>
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-foreground leading-tight">
                        {actu.titre}
                    </h1>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground font-medium flex-wrap">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            <span>Le Conseil Syndical</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <time dateTime={actu.created_at}>{format(new Date(actu.created_at), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}</time>
                        </div>
                    </div>
                </div>

                {actu.image_url && (
                    <Card className="overflow-hidden border-border bg-muted shadow-md mb-8">
                        <img src={actu.image_url} alt={actu.titre} className="w-full h-auto max-h-[500px] object-cover" />
                    </Card>
                )}

                <div className="prose prose-lg dark:prose-invert max-w-none text-foreground prose-p:leading-relaxed prose-headings:text-primary">
                    {/* On utilise dangerouslySetInnerHTML car les articles seront créés avec un éditeur Rich Text */}
                    <div dangerouslySetInnerHTML={{ __html: actu.contenu }} />
                </div>

                {actu.pdf_url && (
                    <Card className="bg-primary/5 border-primary/20 mt-12 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
                        <div className="absolute top-0 left-0 w-2 h-full bg-primary"></div>
                        <a href={actu.pdf_url} target="_blank" rel="noopener noreferrer" className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <FileDown className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Document joint</h3>
                                    <p className="text-sm text-muted-foreground">Cliquez pour consulter ou télécharger le PDF au format complet.</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors md:block hidden" />
                        </a>
                    </Card>
                )}
            </div>
        </article>
    );
}
