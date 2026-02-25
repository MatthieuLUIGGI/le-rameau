"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Loader2, Plus, Trash2, UploadCloud, Link as LinkIcon, FileCheck, ArrowUp, ArrowDown, ArrowLeft, Save } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logAction } from "../../../../lib/logger";
import { createNotification, deleteNotificationByEntity } from "../../../../lib/notifications";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../../components/ui/dialog";

interface DocumentBox {
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
    fileToUpload?: File | null;
}

interface AssembleeRow {
    id: string; // uuid from db or temp
    position: number;
    pv: DocumentBox;
    rapport: DocumentBox;
}

// Extraction du composant pour éviter la perte de focus lors du re-rendu
const BoxEditor = ({ row, rowIndex, col, label, handleBoxChange, saveBox, isSavingBox }: { row: AssembleeRow, rowIndex: number, col: 'pv' | 'rapport', label: string, handleBoxChange: (rowIndex: number, col: 'pv' | 'rapport', field: keyof DocumentBox, value: any) => void, saveBox: (rowIndex: number, col: 'pv' | 'rapport') => void, isSavingBox: boolean }) => {
    const box = row[col];
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (box.type !== 'file') return;

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleBoxChange(rowIndex, col, 'fileToUpload', e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="flex-1 space-y-3 bg-muted/20 p-4 border border-border/50 rounded-xl relative">
            <div className="flex justify-between items-center mb-2 border-b border-border/50 pb-2">
                <div className="font-semibold text-primary">{label}</div>
                <Button
                    size="sm"
                    onClick={() => saveBox(rowIndex, col)}
                    disabled={isSavingBox}
                    className="h-7 text-xs px-2"
                >
                    {isSavingBox ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                    Sauvegarder
                </Button>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Titre de l'événement</label>
                <Input
                    placeholder="Ex: Assemblée du Q1..."
                    value={box.titre}
                    onChange={e => handleBoxChange(rowIndex, col, 'titre', e.target.value)}
                    className="h-9"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Date</label>
                <Input
                    type="date"
                    value={box.date}
                    onChange={e => handleBoxChange(rowIndex, col, 'date', e.target.value)}
                    className="h-9"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Type de contenu</label>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant={box.type === 'file' ? 'default' : 'outline'}
                        onClick={() => handleBoxChange(rowIndex, col, 'type', 'file')}
                        className="flex-1 h-8 text-xs"
                    >
                        <UploadCloud className="w-3 h-3 mr-1" /> Fichier
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={box.type === 'link' ? 'default' : 'outline'}
                        onClick={() => handleBoxChange(rowIndex, col, 'type', 'link')}
                        className="flex-1 h-8 text-xs"
                    >
                        <LinkIcon className="w-3 h-3 mr-1" /> Lien
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={box.type === 'empty' ? 'destructive' : 'outline'}
                        onClick={() => handleBoxChange(rowIndex, col, 'type', 'empty')}
                        className="flex-none px-2 h-8 text-xs"
                        title="Vider la case"
                    >
                        Vide
                    </Button>
                </div>
            </div>

            {box.type === 'link' && (
                <div className="space-y-1 mt-2">
                    <label className="text-xs font-semibold text-muted-foreground">URL du document</label>
                    <Input
                        placeholder="https://..."
                        value={box.url}
                        onChange={e => handleBoxChange(rowIndex, col, 'url', e.target.value)}
                        className="h-9"
                    />
                </div>
            )}

            {box.type === 'file' && (
                <div
                    className="border-2 border-dashed border-border/70 hover:border-primary/50 transition-colors rounded-lg p-4 mt-2 text-center flex flex-col items-center justify-center cursor-pointer bg-background"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                                handleBoxChange(rowIndex, col, 'fileToUpload', e.target.files[0]);
                            }
                        }}
                    />
                    {box.fileToUpload ? (
                        <div className="text-sm font-medium text-green-600 flex flex-col items-center gap-1">
                            <FileCheck className="w-5 h-5" />
                            <span className="truncate w-40">{box.fileToUpload.name}</span>
                        </div>
                    ) : box.url ? (
                        <div className="text-sm font-medium text-blue-500 flex flex-col items-center gap-1">
                            <FileCheck className="w-5 h-5" />
                            <span>Fichier enregistré (cliquez pour remplacer)</span>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                            <UploadCloud className="w-5 h-5" />
                            <span>Glissez un fichier ou cliquez ici</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function AdminAssembleeGeneralePage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [rows, setRows] = useState<AssembleeRow[]>([]);
    const [isSavingBox, setIsSavingBox] = useState<{ rowIndex: number, col: string } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ index: number, id: string } | null>(null);

    useEffect(() => {
        if (!userLoading && user && user.role !== 'ag') {
            redirect("/accueil");
        }
    }, [user, userLoading]);

    useEffect(() => {
        if (!userLoading && user?.role === 'ag') {
            fetchRows();
        }
    }, [user, userLoading]);

    const fetchRows = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('assemblee_generale').select('*').order('position', { ascending: true });

        if (error) {
            toast({ title: "Erreur", description: "Impossible de charger les documents.", variant: "destructive" });
        } else if (data && data.length > 0) {
            setRows(data.map(d => ({
                id: d.id,
                position: d.position,
                pv: { titre: d.pv_titre || '', date: d.pv_date || '', type: d.pv_type || 'empty', url: d.pv_url || '' },
                rapport: { titre: d.rapport_titre || '', date: d.rapport_date || '', type: d.rapport_type || 'empty', url: d.rapport_url || '' }
            })));
        } else {
            // Initialisation avec 3 lignes par défaut si rien n'existe
            setRows([
                createEmptyRow(0),
                createEmptyRow(1),
                createEmptyRow(2),
            ]);
        }
        setIsLoading(false);
    };

    const createEmptyRow = (pos: number): AssembleeRow => {
        return {
            id: `temp-${Date.now()}-${pos}`,
            position: pos,
            pv: { titre: "", date: "", type: "empty", url: "" },
            rapport: { titre: "", date: "", type: "empty", url: "" }
        };
    };

    const addRow = () => {
        // Ajouter en haut de la liste
        setRows(prev => [createEmptyRow(Date.now()), ...prev]);
    };

    const confirmRemoveRow = (rowIndex: number, rowId: string) => {
        setDeleteConfirm({ index: rowIndex, id: rowId });
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setIsSaving(true);
        const { index: rowIndex, id: rowId } = deleteConfirm;

        if (!rowId.startsWith('temp-')) {
            const supabase = createClient();
            const { data: rowToDelete } = await supabase.from('assemblee_generale').select('*').eq('id', rowId).single();

            await supabase.from('assemblee_generale').delete().eq('id', rowId);
            if (user) {
                await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, `A supprimé une ligne de document du Assemblée Générale`, rowToDelete || null, null);
            }
            await deleteNotificationByEntity(rowId);
        }
        setRows(prev => prev.filter((_, idx) => idx !== rowIndex));
        setIsSaving(false);
        setDeleteConfirm(null);
    };

    const moveRowUp = (index: number) => {
        if (index === 0) return;
        setRows(prev => {
            const newRows = [...prev];
            const temp = newRows[index - 1];
            newRows[index - 1] = newRows[index];
            newRows[index] = temp;
            return newRows;
        });
    };

    const moveRowDown = (index: number) => {
        if (index === rows.length - 1) return;
        setRows(prev => {
            const newRows = [...prev];
            const temp = newRows[index + 1];
            newRows[index + 1] = newRows[index];
            newRows[index] = temp;
            return newRows;
        });
    };

    const handleBoxChange = (rowIndex: number, col: 'pv' | 'rapport', field: keyof DocumentBox, value: any) => {
        setRows(prev => {
            const newRows = [...prev];
            newRows[rowIndex][col] = { ...newRows[rowIndex][col], [field]: value };

            // Si le type change vers empty ou link, on vire le fichier potentiel
            if (field === 'type' && value !== 'file') {
                newRows[rowIndex][col].fileToUpload = null;
            }
            return newRows;
        });
    };

    const handleFileUpload = async (file: File): Promise<string | null> => {
        const supabase = createClient();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError, data } = await supabase.storage.from('ag_docs').upload(filePath, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            toast({ title: "Erreur", description: "Le téléversement du fichier a échoué: " + uploadError.message, variant: "destructive" });
            return null;
        }

        const { data: publicUrlData } = supabase.storage.from('ag_docs').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
    };

    const saveBox = async (rowIndex: number, col: 'pv' | 'rapport') => {
        setIsSavingBox({ rowIndex, col });
        const supabase = createClient();

        try {
            const { data: existingRows } = await supabase.from('assemblee_generale').select('*');
            const row = rows[rowIndex];
            const updatedRow: any = {
                position: rowIndex,
                pv_titre: row.pv.titre,
                pv_date: row.pv.date,
                pv_type: row.pv.type,
                rapport_titre: row.rapport.titre,
                rapport_date: row.rapport.date,
                rapport_type: row.rapport.type,
            };

            // Only process file uploads for the column being saved to save time
            if (col === 'pv') {
                if (row.pv.type === 'file' && row.pv.fileToUpload) {
                    const url = await handleFileUpload(row.pv.fileToUpload);
                    if (url) updatedRow.pv_url = url;
                } else if (row.pv.type === 'link') {
                    updatedRow.pv_url = row.pv.url;
                } else if (row.pv.type === 'empty') {
                    updatedRow.pv_url = "";
                } else {
                    updatedRow.pv_url = row.pv.url;
                }
                updatedRow.rapport_url = row.rapport.url; // Keep existing
            } else {
                if (row.rapport.type === 'file' && row.rapport.fileToUpload) {
                    const url = await handleFileUpload(row.rapport.fileToUpload);
                    if (url) updatedRow.rapport_url = url;
                } else if (row.rapport.type === 'link') {
                    updatedRow.rapport_url = row.rapport.url;
                } else if (row.rapport.type === 'empty') {
                    updatedRow.rapport_url = "";
                } else {
                    updatedRow.rapport_url = row.rapport.url;
                }
                updatedRow.pv_url = row.pv.url; // Keep existing
            }

            let response;
            if (row.id.startsWith('temp-')) {
                response = await supabase.from('assemblee_generale').insert([updatedRow]).select().single();
                if (response.error) throw response.error;

                if (user && response.data) {
                    await logAction('Création', user.id, `${user.prenom} ${user.nom}`, user.email, `A créé un document AG`, null, response.data);
                    await createNotification("Nouveau document AG", `Le document "${row[col].titre || (col === 'pv' ? 'Procès-Verbal' : 'Rapport')}" a été ajouté.`, "/ag", "ag", response.data.id);
                }
            } else {
                const originalRow = existingRows?.find((r: any) => r.id === row.id) || null;
                response = await supabase.from('assemblee_generale').update(updatedRow).eq('id', row.id).select().single();
                if (response.error) throw response.error;

                if (user && response.data) {
                    await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `A modifié le document AG`, originalRow, response.data);
                    await createNotification("Document AG mis à jour", `Le document "${row[col].titre || (col === 'pv' ? 'Procès-Verbal' : 'Rapport')}" a été mis à jour.`, "/ag", "ag", response.data.id);
                }
            }
            toast({ title: "Succès", description: "Le document a été sauvegardé avec succès." });
            fetchRows();
        } catch (err: any) {
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setIsSavingBox(null);
        }
    };

    const saveChanges = async () => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const updatedRow: any = {
                    position: i, // L'index est répercuté ici garantissant le bon ordre
                    pv_titre: row.pv.titre,
                    pv_date: row.pv.date,
                    pv_type: row.pv.type,
                    rapport_titre: row.rapport.titre,
                    rapport_date: row.rapport.date,
                    rapport_type: row.rapport.type,
                };

                // Handle file uploads OJ
                if (row.pv.type === 'file' && row.pv.fileToUpload) {
                    const url = await handleFileUpload(row.pv.fileToUpload);
                    if (url) updatedRow.pv_url = url;
                } else if (row.pv.type === 'link') {
                    updatedRow.pv_url = row.pv.url;
                } else if (row.pv.type === 'empty') {
                    updatedRow.pv_url = "";
                } else {
                    updatedRow.pv_url = row.pv.url; // Keep existing if file but no new file uploaded
                }

                // Handle file uploads CR
                if (row.rapport.type === 'file' && row.rapport.fileToUpload) {
                    const url = await handleFileUpload(row.rapport.fileToUpload);
                    if (url) updatedRow.rapport_url = url;
                } else if (row.rapport.type === 'link') {
                    updatedRow.rapport_url = row.rapport.url;
                } else if (row.rapport.type === 'empty') {
                    updatedRow.rapport_url = "";
                } else {
                    updatedRow.rapport_url = row.rapport.url;
                }

                if (row.id.startsWith('temp-')) {
                    await supabase.from('assemblee_generale').insert([updatedRow]);
                } else {
                    await supabase.from('assemblee_generale').update(updatedRow).eq('id', row.id);
                }
            }
            toast({ title: "Succès", description: "L'ordre des documents a été mis à jour." });
            fetchRows(); // reload new DB ids
        } catch (err: any) {
            toast({ title: "Erreur", description: err.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
                        <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground">Docs de l'AG</h1>
                        <p className="text-muted-foreground">Gérez les procès-verbaux et rapports d'activité. Modifiez par paires (lignes).</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={addRow} variant="outline" className="font-semibold">
                        <Plus className="w-4 h-4 mr-2" /> Ajouter en haut
                    </Button>
                    <Button onClick={saveChanges} disabled={isSaving} className="font-bold px-8">
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Enregistrer tout
                    </Button>
                </div>
            </div>

            <Card className="bg-surface border-border shadow-md">
                <CardContent className="p-6 space-y-6">
                    {rows.map((row, idx) => (
                        <div key={row.id} className="relative bg-background border border-border rounded-2xl p-4 sm:p-6 pb-8 shadow-sm">
                            <div className="absolute top-4 right-4 z-10 flex items-center gap-1">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => moveRowUp(idx)} disabled={idx === 0} title="Monter d'un cran">
                                    <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full" onClick={() => moveRowDown(idx)} disabled={idx === rows.length - 1} title="Descendre d'un cran">
                                    <ArrowDown className="w-4 h-4" />
                                </Button>
                                <div className="w-px h-6 bg-border mx-1"></div>
                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0 rounded-full" onClick={() => confirmRemoveRow(idx, row.id)} title="Supprimer la ligne entière text-danger">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="font-bold text-lg mb-4 text-foreground opacity-80">Ligne #{idx + 1}</div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <BoxEditor
                                    row={row}
                                    rowIndex={idx}
                                    col="pv"
                                    label="Procès-Verbal (PV)"
                                    handleBoxChange={handleBoxChange}
                                    saveBox={saveBox}
                                    isSavingBox={isSavingBox?.rowIndex === idx && isSavingBox?.col === 'pv'}
                                />
                                <BoxEditor
                                    row={row}
                                    rowIndex={idx}
                                    col="rapport"
                                    label="Rapport d'activité du CS"
                                    handleBoxChange={handleBoxChange}
                                    saveBox={saveBox}
                                    isSavingBox={isSavingBox?.rowIndex === idx && isSavingBox?.col === 'rapport'}
                                />
                            </div>
                        </div>
                    ))}

                    {rows.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            Aucune ligne configurée. Cliquez sur "Ajouter en haut".
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la suppression</DialogTitle>
                        <DialogDescription>
                            Voulez-vous vraiment supprimer la ligne #{deleteConfirm ? deleteConfirm.index + 1 : ''} (PV et Rapport d'activité) de l'Assemblée Générale ?
                            Cette action supprimera également les notifications associées.
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
