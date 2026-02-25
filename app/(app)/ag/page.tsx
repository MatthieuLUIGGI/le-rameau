"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useUser } from "../../../lib/hooks/useUser";
import { Loader2, FileText, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DocumentBox {
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
}

interface AssembleeRow {
    id: string;
    position: number;
    pv: DocumentBox;
    rapport: DocumentBox;
}

export default function AGPage() {
    const { user, isLoading: userLoading } = useUser();
    const [rows, setRows] = useState<AssembleeRow[]>([]);
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
            setRows(data.map(d => ({
                id: d.id,
                position: d.position,
                pv: { titre: d.pv_titre || '', date: d.pv_date || '', type: d.pv_type || 'empty', url: d.pv_url || '' },
                rapport: { titre: d.rapport_titre || '', date: d.rapport_date || '', type: d.rapport_type || 'empty', url: d.rapport_url || '' }
            })));
        }
        setIsLoadingDocs(false);
    };

    if (userLoading || isLoadingDocs) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    const DocumentCard = ({ box, label }: { box: DocumentBox, label: string }) => {
        if (box.type === 'empty') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5 opacity-50">
                    <span className="text-sm font-medium text-muted-foreground">{label} : En attente</span>
                </div>
            );
        }

        const isLink = box.type === 'link';

        return (
            <a
                href={box.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group bg-surface hover:bg-muted/30 border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center sm:items-start text-center sm:text-left gap-3 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {isLink ? <ExternalLink className="w-16 h-16 -mt-2 -mr-2 text-primary" /> : <FileText className="w-16 h-16 -mt-2 -mr-2 text-primary" />}
                </div>

                <div className="bg-primary/10 text-primary p-3 rounded-xl mb-1">
                    {isLink ? <ExternalLink className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>

                <div className="space-y-1 relative z-10 w-full">
                    <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                        {box.titre || label}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground font-medium gap-1.5 pt-1">
                        <CalendarIcon className="w-4 h-4" />
                        {box.date ? format(new Date(box.date), "dd MMMM yyyy", { locale: fr }) : "Date non spécifiée"}
                    </div>
                </div>
            </a>
        );
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-border mt-6 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-primary to-blue-500"></div>
                <h1 className="text-3xl font-extrabold text-foreground mb-4">Assemblée Générale</h1>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
                    Retrouvez ici les Procès-Verbaux (PV) de l'Assemblée Générale et les rapports d'activité correspondants du Conseil Syndical.
                </p>
            </div>

            {rows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-medium bg-surface rounded-2xl border border-border border-dashed">
                    Aucun document n'a été publié pour le moment.
                </div>
            ) : (
                <div className="space-y-6">
                    {rows.map((row) => (
                        <div key={row.id} className="relative bg-background border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-stretch gap-6">
                                <DocumentCard box={row.pv} label="Procès-Verbal (PV)" />

                                <div className="hidden md:flex flex-col items-center justify-center">
                                    <div className="w-px h-16 bg-border"></div>
                                    <div className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full my-2">ET</div>
                                    <div className="w-px h-16 bg-border"></div>
                                </div>
                                <div className="flex md:hidden items-center justify-center w-full">
                                    <div className="h-px w-16 bg-border"></div>
                                    <div className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full mx-2">ET</div>
                                    <div className="h-px w-16 bg-border"></div>
                                </div>

                                <DocumentCard box={row.rapport} label="Rapport d'activité" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
