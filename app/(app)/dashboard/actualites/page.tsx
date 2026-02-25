"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Megaphone, Save, ArrowLeft, Loader2, Info, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../../components/ui/dialog";
import { logAction } from "../../../../lib/logger";
import { deleteNotificationByEntity } from "../../../../lib/notifications";

interface Actualite {
    id: string;
    titre: string;
    priorite: 'basse' | 'normale' | 'haute';
    created_at: string;
    date_expiration: string | null;
}

const mapPrioriteToLabel = (priorite: string) => {
    switch (priorite) {
        case 'haute': return 'Haute';
        case 'normale': return 'Normale';
        case 'basse': return 'Basse';
        default: return priorite;
    }
};

export default function AdminActualitesPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [actualites, setActualites] = useState<Actualite[]>([]);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        if (!userLoading && user && user.role !== 'ag') {
            redirect("/accueil");
        }
    }, [user, userLoading]);

    const fetchData = async () => {
        const supabase = createClient();
        const { data } = await supabase.from('actualites').select('id, titre, priorite, created_at, date_expiration').order('created_at', { ascending: false });

        if (data) setActualites(data as Actualite[]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        setDeleteConfirm({ id, name });
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setIsSaving(true);
        const supabase = createClient();

        // Récupérer l'élément complet avant suppression pour l'avoir dans les logs
        const { data: itemToDelete } = await supabase.from('actualites').select('*').eq('id', deleteConfirm.id).single();

        const { error } = await supabase.from('actualites').delete().eq('id', deleteConfirm.id);
        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            if (user) {
                await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, `A supprimé l'actualité: ${deleteConfirm.name}`, itemToDelete || null, null);
            }
            await deleteNotificationByEntity(deleteConfirm.id);
            toast({ title: "Succès", description: "L'actualité a été supprimée." });
            setActualites(prev => prev.filter(a => a.id !== deleteConfirm.id));
        }
        setIsSaving(false);
        setDeleteConfirm(null);
    };

    if (userLoading || isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                        <Megaphone className="h-8 w-8 text-primary" />
                        Gestion Actualités
                    </h1>
                </div>
                <Button asChild className="font-bold">
                    <Link href="/dashboard/actualites/create">
                        <Plus className="w-5 h-5 mr-2" /> Créer une annonce
                    </Link>
                </Button>
            </div>

            <Card className="bg-surface border-border shadow-md">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" /> Annonces publiées
                    </CardTitle>
                    <CardDescription>Liste de toutes les communications de la résidence.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {actualites.length === 0 ? (
                        <div className="text-center p-12 border-b border-border/50">
                            <p className="text-muted-foreground font-medium text-lg">Aucune actualité publiée pour le moment.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {actualites.map((actu) => {
                                const isExpired = actu.date_expiration && new Date(actu.date_expiration) < new Date();

                                return (
                                    <div key={actu.id} className={`flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
                                        <div className="min-w-0 pr-4">
                                            <h3 className="font-bold text-lg mb-1 truncate text-foreground flex items-center gap-2">
                                                {actu.titre}
                                                {isExpired && <span className="text-[10px] bg-destructive/10 text-destructive border-transparent px-2 py-0.5 rounded-full uppercase ml-2 tracking-widest">Expirée</span>}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                                                <span>{format(new Date(actu.created_at), "d MMMM yyyy", { locale: fr })}</span>
                                                <span className="flex items-center gap-1.5 opacity-80 before:content-['•'] before:mr-2">
                                                    Priorité {mapPrioriteToLabel(actu.priorite)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 tabular-nums">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/dashboard/actualites/edit/${actu.id}`}>
                                                    <Edit className="w-4 h-4 mr-2" /> Editer
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(actu.id, actu.titre)} className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0">
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer l'actualité <strong className="text-foreground">{deleteConfirm?.name}</strong> ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isSaving}>Annuler</Button>
                        <Button variant="destructive" onClick={executeDelete} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                            Supprimer définitivement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
