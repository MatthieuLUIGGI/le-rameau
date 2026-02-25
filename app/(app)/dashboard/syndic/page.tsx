"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Building, Save, ArrowLeft, Loader2, Info, Plus, Trash2 } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../../components/ui/dialog";
import { logAction } from "../../../../lib/logger";

interface Syndic {
    id: string;
    nom: string;
    fonction: string;
    photo_url: string;
    telephone: string;
    email: string;
    adresse: string;
    gestionnaire: string;
    assistante: string;
}

interface ConseilSyndical {
    id: string;
    nom: string;
    batiment: string;
    photo_url: string;
}

export default function AdminSyndicPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [syndicList, setSyndicList] = useState<Syndic[]>([]);
    const [conseilList, setConseilList] = useState<ConseilSyndical[]>([]);

    useEffect(() => {
        if (!userLoading && user && user.role !== 'ag') {
            redirect("/accueil");
        }
    }, [user, userLoading]);

    const fetchData = async () => {
        const supabase = createClient();
        const [resSyndic, resConseil] = await Promise.all([
            supabase.from('syndic').select('*').order('updated_at', { ascending: true }),
            supabase.from('membres_conseil_syndical').select('*').order('batiment')
        ]);

        if (resSyndic.data) setSyndicList(resSyndic.data as Syndic[]);
        if (resConseil.data) setConseilList(resConseil.data as ConseilSyndical[]);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddSyndic = () => {
        setSyndicList([
            ...syndicList,
            { id: "new-" + Date.now(), nom: "", fonction: "Syndic de Copropriété", photo_url: "", telephone: "", email: "", adresse: "", gestionnaire: "", assistante: "" }
        ]);
    };

    const handleAddConseil = () => {
        setConseilList([
            ...conseilList,
            { id: "new-" + Date.now(), nom: "", batiment: "Bâtiment A", photo_url: "" }
        ]);
    };

    const handleSyndicChange = (id: string, field: string, value: string) => {
        setSyndicList(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleConseilChange = (id: string, field: string, value: string) => {
        setConseilList(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'syndic' | 'conseil', name: string } | null>(null);

    const handleDeleteSyndic = async (id: string, name: string) => {
        if (id.startsWith('new-')) {
            setSyndicList(prev => prev.filter(s => s.id !== id));
            return;
        }
        setDeleteConfirm({ id, type: 'syndic', name });
    };

    const handleDeleteConseil = async (id: string, name: string) => {
        if (id.startsWith('new-')) {
            setConseilList(prev => prev.filter(c => c.id !== id));
            return;
        }
        setDeleteConfirm({ id, type: 'conseil', name });
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setIsSaving(true);
        const supabase = createClient();
        const table = deleteConfirm.type === 'syndic' ? 'syndic' : 'membres_conseil_syndical';

        const { error } = await supabase.from(table).delete().eq('id', deleteConfirm.id);
        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            if (user) {
                const deletedItem = deleteConfirm.type === 'syndic'
                    ? syndicList.find(s => s.id === deleteConfirm.id)
                    : conseilList.find(c => c.id === deleteConfirm.id);
                await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, `A supprimé le ${deleteConfirm.type === 'syndic' ? 'bureau syndic' : 'membre conseil'}: ${deleteConfirm.name}`, deletedItem, null);
            }
            toast({ title: "Succès", description: "L'élément a été supprimé." });
            if (deleteConfirm.type === 'syndic') {
                setSyndicList(prev => prev.filter(s => s.id !== deleteConfirm.id));
            } else {
                setConseilList(prev => prev.filter(c => c.id !== deleteConfirm.id));
            }
        }
        setIsSaving(false);
        setDeleteConfirm(null);
    };

    const handleSaveSyndic = async (syndic: Syndic) => {
        setIsSaving(true);
        const supabase = createClient();
        const { id, ...data } = syndic;
        let originalSyndic = null;
        if (!id.startsWith('new-')) {
            const { data: currentData } = await supabase.from('syndic').select('*').eq('id', id).single();
            originalSyndic = currentData;
        }

        let response;
        if (id.startsWith('new-')) {
            response = await supabase.from('syndic').insert([data]);
        } else {
            response = await supabase.from('syndic').update(data).eq('id', id);
        }

        if (response.error) {
            toast({ title: "Erreur", description: response.error.message, variant: "destructive" });
        } else {
            if (user) {
                await logAction(id.startsWith('new-') ? 'Création' : 'Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `Syndic: ${data.nom}`, originalSyndic, data);
            }
            toast({ title: "Succès", description: "Les informations du syndic ont été mises à jour." });
            fetchData();
        }
        setIsSaving(false);
    };

    const handleSaveConseil = async (membre: ConseilSyndical) => {
        setIsSaving(true);
        const supabase = createClient();
        const { id, ...data } = membre;
        let originalConseil = null;
        if (!id.startsWith('new-')) {
            const { data: currentData } = await supabase.from('membres_conseil_syndical').select('*').eq('id', id).single();
            originalConseil = currentData;
        }

        let response;
        if (id.startsWith('new-')) {
            response = await supabase.from('membres_conseil_syndical').insert([data]);
        } else {
            response = await supabase.from('membres_conseil_syndical').update(data).eq('id', id);
        }

        if (response.error) {
            toast({ title: "Erreur", description: response.error.message, variant: "destructive" });
        } else {
            if (user) {
                await logAction(id.startsWith('new-') ? 'Création' : 'Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `Conseil Syndical: ${data.nom}`, originalConseil, data);
            }
            toast({ title: "Succès", description: "Le membre du conseil a été sauvegardé." });
            fetchData();
        }
        setIsSaving(false);
    };

    if (userLoading || isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                    <Building className="h-8 w-8 text-primary" />
                    Gestion Syndic
                </h1>
            </div>

            {/* Niveau 1 : Le Syndic */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-bold">Niveau 1 : Le Bureau</h2>
                    </div>
                </div>

                {syndicList.length === 0 && (
                    <div className="text-center p-8 bg-surface border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground mb-4">Aucun bureau de syndic n'est ajouté actuellement.</p>
                    </div>
                )}

                {syndicList.map((syndic) => (
                    <Card key={syndic.id} className="bg-surface border-border shadow-md">
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Nom & Raison sociale</label>
                                    <Input value={syndic.nom} onChange={e => handleSyndicChange(syndic.id, 'nom', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Fonction affichée</label>
                                    <Input value={syndic.fonction} onChange={e => handleSyndicChange(syndic.id, 'fonction', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Gestionnaire référent</label>
                                    <Input value={syndic.gestionnaire} onChange={e => handleSyndicChange(syndic.id, 'gestionnaire', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Assistante</label>
                                    <Input value={syndic.assistante} onChange={e => handleSyndicChange(syndic.id, 'assistante', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Téléphone</label>
                                    <Input value={syndic.telephone} onChange={e => handleSyndicChange(syndic.id, 'telephone', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-foreground">Email</label>
                                    <Input value={syndic.email} onChange={e => handleSyndicChange(syndic.id, 'email', e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-foreground">Adresse complète</label>
                                    <Input value={syndic.adresse} onChange={e => handleSyndicChange(syndic.id, 'adresse', e.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-bold text-foreground">URL Photo de couverture (Optionnel)</label>
                                    <Input value={syndic.photo_url} onChange={e => handleSyndicChange(syndic.id, 'photo_url', e.target.value)} placeholder="https://..." />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={() => handleSaveSyndic(syndic)} disabled={isSaving} className="font-bold w-full md:w-auto">
                                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                    Sauvegarder
                                </Button>
                                <Button onClick={() => handleDeleteSyndic(syndic.id, syndic.nom)} disabled={isSaving} variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                <Button onClick={handleAddSyndic} variant="outline" className="w-full font-bold border-dashed border-2 py-8">
                    <Plus className="w-5 h-5 mr-2" /> Ajouter un Syndic
                </Button>
            </div>

            {/* Niveau 2 : Conseil Syndical */}
            <div className="space-y-6 pt-12 border-t border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        <h2 className="text-2xl font-bold">Niveau 2 : Membres du Conseil Syndical</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {conseilList.map((membre) => (
                        <Card key={membre.id} className="bg-surface border-border shadow-sm">
                            <CardContent className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-end gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 w-full">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Prénom & Nom</label>
                                        <Input value={membre.nom} onChange={e => handleConseilChange(membre.id, 'nom', e.target.value)} placeholder="Ex: Jean Dupont" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">Bâtiment</label>
                                        <Input value={membre.batiment} onChange={e => handleConseilChange(membre.id, 'batiment', e.target.value)} placeholder="Ex: Bâtiment A" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase">URL Photo</label>
                                        <Input value={membre.photo_url} onChange={e => handleConseilChange(membre.id, 'photo_url', e.target.value)} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <Button onClick={() => handleSaveConseil(membre)} disabled={isSaving} className="font-bold flex-1 md:flex-none">
                                        <Save className="w-4 h-4 mr-2" /> <span className="md:hidden lg:inline">Enregistrer</span>
                                    </Button>
                                    <Button onClick={() => handleDeleteConseil(membre.id, membre.nom)} disabled={isSaving} variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive hover:text-destructive px-3 px-3">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button onClick={handleAddConseil} variant="outline" className="w-full font-bold border-dashed border-2 py-8">
                        <Plus className="w-5 h-5 mr-2" /> Ajouter un membre au conseil
                    </Button>
                </div>
            </div>

            <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer {deleteConfirm?.type === 'syndic' ? 'le bureau de syndic' : 'le membre du conseil'} <strong className="text-foreground">{deleteConfirm?.name}</strong> ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isSaving}>
                            Annuler
                        </Button>
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
