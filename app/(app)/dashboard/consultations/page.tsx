"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { MessageSquare, Save, ArrowLeft, Loader2, Info, Plus, Trash2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../../components/ui/dialog";
import { logAction } from "../../../../lib/logger";
import { createNotification, deleteNotificationByEntity } from "../../../../lib/notifications";

interface Option {
    id: string;
    texte: string;
}

interface Consultation {
    id: string;
    question: string;
    options: Option[];
    statut: 'actif' | 'termine';
    created_at: string;
}

interface VoteStats {
    total: number;
    options: Record<string, number>; // option_id -> count
}

export default function AdminConsultationsPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [votes, setVotes] = useState<Record<string, VoteStats>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        if (!userLoading && user && user.role !== 'ag') {
            redirect("/accueil");
        }
    }, [user, userLoading]);

    const fetchData = async () => {
        const supabase = createClient();

        // 1. Fetch consultations
        const { data: cData } = await supabase.from('consultations').select('*').order('created_at', { ascending: false });

        // 2. Fetch all votes to calculate stats
        const { data: vData } = await supabase.from('consultation_votes').select('consultation_id, option_id');

        if (cData) setConsultations(cData as Consultation[]);

        if (vData) {
            const stats: Record<string, VoteStats> = {};
            vData.forEach(vote => {
                const cid = vote.consultation_id;
                const oid = vote.option_id;
                if (!stats[cid]) stats[cid] = { total: 0, options: {} };
                if (!stats[cid].options[oid]) stats[cid].options[oid] = 0;

                stats[cid].total += 1;
                stats[cid].options[oid] += 1;
            });
            setVotes(stats);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddConsultation = () => {
        setConsultations([
            {
                id: "new-" + Date.now(),
                question: "",
                options: [{ id: "opt-1", texte: "Pour" }, { id: "opt-2", texte: "Contre" }],
                statut: 'actif',
                created_at: new Date().toISOString()
            },
            ...consultations
        ]);
    };

    const handleQuestionChange = (id: string, value: string) => {
        setConsultations(prev => prev.map(c => c.id === id ? { ...c, question: value } : c));
    };

    const handleOptionChange = (cid: string, oid: string, value: string) => {
        setConsultations(prev => prev.map(c => {
            if (c.id !== cid) return c;
            return {
                ...c,
                options: c.options.map(o => o.id === oid ? { ...o, texte: value } : o)
            };
        }));
    };

    const handleAddOption = (cid: string) => {
        setConsultations(prev => prev.map(c => {
            if (c.id !== cid) return c;
            return {
                ...c,
                options: [...c.options, { id: "opt-" + Date.now(), texte: "" }]
            };
        }));
    };

    const handleRemoveOption = (cid: string, oid: string) => {
        setConsultations(prev => prev.map(c => {
            if (c.id !== cid) return c;
            if (c.options.length <= 2) {
                toast({ title: "Attention", description: "Il faut au moins 2 options par sondage.", variant: "destructive" });
                return c;
            }
            return {
                ...c,
                options: c.options.filter(o => o.id !== oid)
            };
        }));
    };

    const toggleStatus = async (consultation: Consultation) => {
        if (consultation.id.startsWith('new-')) {
            toast({ title: "Attention", description: "Veuillez d'abord sauvegarder cette consultation." });
            return;
        }
        setIsSaving(true);
        const newStatus = consultation.statut === 'actif' ? 'termine' : 'actif';
        const supabase = createClient();
        const { error } = await supabase.from('consultations').update({ statut: newStatus }).eq('id', consultation.id);

        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            if (user) {
                const oldStatus = consultation.statut;
                await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `Le statut du sondage "${consultation.question}" est passé à ${newStatus}`, { statut: oldStatus }, { statut: newStatus });
            }
            toast({ title: "Succès", description: `Le sondage est maintenant ${newStatus === 'actif' ? 'actif' : 'terminé'}.` });
            setConsultations(prev => prev.map(c => c.id === consultation.id ? { ...c, statut: newStatus } : c));
        }
        setIsSaving(false);
    };

    const handleSave = async (consultation: Consultation) => {
        if (consultation.question.trim() === "") {
            toast({ title: "Erreur", description: "La question ne peut pas être vide.", variant: "destructive" });
            return;
        }
        if (consultation.options.some(o => o.texte.trim() === "")) {
            toast({ title: "Erreur", description: "Toutes les options doivent avoir un texte.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        const supabase = createClient();
        const payload = {
            question: consultation.question,
            options: consultation.options,
            statut: consultation.statut
        };

        let originalConsultation = null;
        if (!consultation.id.startsWith('new-')) {
            const { data } = await supabase.from('consultations').select('*').eq('id', consultation.id).single();
            originalConsultation = data;
        }

        if (consultation.id.startsWith('new-')) {
            const { data, error } = await supabase.from('consultations').insert([payload]).select('id').single();
            if (error) {
                toast({ title: "Erreur", description: error.message, variant: "destructive" });
            } else {
                if (user) {
                    await logAction('Création', user.id, `${user.prenom} ${user.nom}`, user.email, `A créé le sondage : ${consultation.question}`, null, payload);
                }
                const newId = data?.id;
                await createNotification("Nouvelle consultation", `Le sondage "${consultation.question}" est disponible.`, "/consultations", "consultation", newId);
                toast({ title: "Succès", description: "Le sondage a été créé." });
                fetchData();
            }
        } else {
            const { error } = await supabase.from('consultations').update(payload).eq('id', consultation.id);
            if (error) {
                toast({ title: "Erreur", description: error.message, variant: "destructive" });
            } else {
                if (user) {
                    await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `A mis à jour le sondage : ${consultation.question}`, originalConsultation, payload);
                }
                await createNotification("Consultation modifiée", `Le sondage "${consultation.question}" a été modifié.`, "/consultations", "consultation", consultation.id);
                toast({ title: "Succès", description: "Le sondage a été mis à jour." });
            }
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (id.startsWith('new-')) {
            setConsultations(prev => prev.filter(c => c.id !== id));
            return;
        }
        setDeleteConfirm({ id, name });
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setIsSaving(true);
        const supabase = createClient();

        const { error } = await supabase.from('consultations').delete().eq('id', deleteConfirm.id);
        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } else {
            if (user) {
                const deletedItem = consultations.find(c => c.id === deleteConfirm.id);
                await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, `A supprimé le sondage : ${deleteConfirm.name}`, deletedItem, null);
            }
            await deleteNotificationByEntity(deleteConfirm.id);
            toast({ title: "Succès", description: "Le sondage a été supprimé." });
            setConsultations(prev => prev.filter(c => c.id !== deleteConfirm.id));
        }
        setIsSaving(false);
        setDeleteConfirm(null);
    };

    if (userLoading || isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        Consultations
                    </h1>
                </div>
                <Button onClick={handleAddConsultation} className="font-bold">
                    <Plus className="w-5 h-5 mr-2" /> Créer un sondage
                </Button>
            </div>

            <div className="space-y-6">
                {consultations.length === 0 && (
                    <div className="text-center p-12 bg-surface border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground font-medium text-lg mb-4">Aucun sondage n'a été créé.</p>
                    </div>
                )}

                {consultations.map((consultation) => {
                    const stat = votes[consultation.id] || { total: 0, options: {} };

                    return (
                        <Card key={consultation.id} className={`bg-surface border-border shadow-md transition-all ${consultation.statut === 'termine' ? 'opacity-80' : ''}`}>
                            <CardHeader className="bg-muted/10 border-b border-border/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex-1 space-y-2 w-full">
                                    <label className="text-sm font-bold text-foreground">Question du sondage <span className="text-danger">*</span></label>
                                    <Input
                                        value={consultation.question}
                                        onChange={e => handleQuestionChange(consultation.id, e.target.value)}
                                        className="font-bold text-lg"
                                        placeholder="Ex: Êtes-vous pour la rénovation des halls ?"
                                        disabled={!consultation.id.startsWith('new-') && stat.total > 0} // on évite de changer la question si y'a des votes
                                    />
                                </div>
                                <div className="flex items-center gap-2 pt-6 sm:pt-0 shrink-0">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${consultation.statut === 'actif' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'}`}>
                                        {consultation.statut === 'actif' ? 'En cours' : 'Clôturé'}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-foreground flex items-center justify-between">
                                        Options de réponse
                                    </label>

                                    <div className="space-y-3">
                                        {consultation.options.map((opt, index) => (
                                            <div key={opt.id} className="flex items-center gap-2">
                                                <Input
                                                    value={opt.texte}
                                                    onChange={e => handleOptionChange(consultation.id, opt.id, e.target.value)}
                                                    placeholder={`Option ${index + 1}`}
                                                    disabled={!consultation.id.startsWith('new-') && stat.total > 0}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveOption(consultation.id, opt.id)}
                                                    disabled={consultation.options.length <= 2 || (!consultation.id.startsWith('new-') && stat.total > 0) || isSaving}
                                                    className="shrink-0 text-muted-foreground hover:text-danger hover:bg-danger/10"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddOption(consultation.id)}
                                        size="sm"
                                        className="w-full border-dashed"
                                        disabled={!consultation.id.startsWith('new-') && stat.total > 0}
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Ajouter une option
                                    </Button>
                                    {(!consultation.id.startsWith('new-') && stat.total > 0) && (
                                        <p className="text-xs text-muted-foreground italic flex items-center gap-1"><Info className="w-3 h-3" /> Impossible de modifier car des votes ont déjà été enregistrés.</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold text-foreground block mb-2">Résultats des votes</label>
                                    {stat.total === 0 ? (
                                        <div className="py-8 flex flex-col justify-center items-center px-4 border rounded-xl bg-muted/20 text-muted-foreground text-sm">
                                            Aucun vote enregistré pour l'instant.
                                        </div>
                                    ) : consultation.statut === 'actif' ? (
                                        <div className="py-8 flex flex-col justify-center items-center px-6 border border-dashed rounded-xl bg-muted/5 text-muted-foreground text-sm space-y-3">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
                                            <p className="font-semibold text-foreground">Résultats masqués pendant le vote</p>
                                            <div className="text-sm font-medium text-muted-foreground bg-surface border px-4 py-1.5 rounded-full shadow-sm">
                                                Déjà <span className="font-bold text-primary">{stat.total}</span> foyers participants
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {consultation.options.map(opt => {
                                                const count = stat.options[opt.id] || 0;
                                                const percentage = Math.round((count / stat.total) * 100);
                                                return (
                                                    <div key={`res-${opt.id}`} className="space-y-1">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="font-semibold text-foreground truncate pl-1" title={opt.texte}>{opt.texte}</span>
                                                            <span className="font-bold text-primary">{percentage}% <span className="text-muted-foreground font-medium text-xs">({count})</span></span>
                                                        </div>
                                                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div className="pt-2 text-xs font-medium text-muted-foreground text-right border-t border-border mt-4">
                                                Total des votants: <span className="font-bold text-foreground">{stat.total} foyers</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/5 border-t border-border/50 flex flex-wrap items-center justify-between gap-4 p-4">
                                <div className="flex items-center gap-2">
                                    <Button onClick={() => toggleStatus(consultation)} variant="outline" size="sm" disabled={isSaving || consultation.id.startsWith('new-')} className={consultation.statut === 'actif' ? "text-warning hover:bg-warning/10 border-warning/30" : "text-success hover:bg-success/10 border-success/30"}>
                                        <RotateCcw className="w-4 h-4 mr-2" /> {consultation.statut === 'actif' ? 'Clôturer ce sondage' : 'Ré-ouvrir ce sondage'}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <Button onClick={() => handleSave(consultation)} disabled={isSaving} className="font-bold flex-1 sm:flex-none">
                                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Sauvegarder
                                    </Button>
                                    <Button onClick={() => handleDelete(consultation.id, consultation.question || 'Nouveau sondage')} disabled={isSaving} variant="outline" className="border-destructive/30 hover:bg-destructive/10 text-destructive hover:text-destructive shrink-0 px-3">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer le sondage <strong className="text-foreground">{deleteConfirm?.name}</strong> et tous ses votes associés ? Cette action est irréversible.
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
