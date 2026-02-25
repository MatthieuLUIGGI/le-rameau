"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Loader2, Plus, Trash2, UploadCloud, Link as LinkIcon, FileCheck, ArrowUp, ArrowDown, ArrowLeft } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logAction } from "../../../../lib/logger";

interface DocumentBox {
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
    fileToUpload?: File | null;
}

interface ConseilRow {
    id: string; // uuid from db or temp
    position: number;
    oj: DocumentBox;
    cr: DocumentBox;
}

// Extraction du composant pour éviter la perte de focus lors du re-rendu
const BoxEditor = ({ row, rowIndex, col, label, handleBoxChange }: { row: ConseilRow, rowIndex: number, col: 'oj' | 'cr', label: string, handleBoxChange: (rowIndex: number, col: 'oj' | 'cr', field: keyof DocumentBox, value: any) => void }) => {
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
            <div className="font-semibold text-primary mb-2 border-b border-border/50 pb-2">{label}</div>

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

export default function AdminConseilSyndicalPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [rows, setRows] = useState<ConseilRow[]>([]);

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
        const { data, error } = await supabase.from('conseil_syndical').select('*').order('position', { ascending: true });

        if (error) {
            toast({ title: "Erreur", description: "Impossible de charger les documents.", variant: "destructive" });
        } else if (data && data.length > 0) {
            setRows(data.map(d => ({
                id: d.id,
                position: d.position,
                oj: { titre: d.oj_titre || '', date: d.oj_date || '', type: d.oj_type || 'empty', url: d.oj_url || '' },
                cr: { titre: d.cr_titre || '', date: d.cr_date || '', type: d.cr_type || 'empty', url: d.cr_url || '' }
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

    const createEmptyRow = (pos: number): ConseilRow => {
        return {
            id: `temp-${Date.now()}-${pos}`,
            position: pos,
            oj: { titre: "", date: "", type: "empty", url: "" },
            cr: { titre: "", date: "", type: "empty", url: "" }
        };
    };

    const addRow = () => {
        // Ajouter en haut de la liste
        setRows(prev => [createEmptyRow(Date.now()), ...prev]);
    };

    const removeRow = async (rowIndex: number, rowId: string) => {
        const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette ligne complète ?");
        if (!confirmDelete) return;

        if (!rowId.startsWith('temp-')) {
            const supabase = createClient();
            const { data: rowToDelete } = await supabase.from('conseil_syndical').select('*').eq('id', rowId).single();

            await supabase.from('conseil_syndical').delete().eq('id', rowId);
            if (user) {
                await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, `A supprimé une ligne de document du Conseil Syndical`, rowToDelete || null, null);
            }
        }
        setRows(prev => prev.filter((_, idx) => idx !== rowIndex));
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

    const handleBoxChange = (rowIndex: number, col: 'oj' | 'cr', field: keyof DocumentBox, value: any) => {
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

        const { error: uploadError, data } = await supabase.storage.from('conseil_docs').upload(filePath, file);

        if (uploadError) {
            console.error("Upload error:", uploadError);
            toast({ title: "Erreur", description: "Le téléversement du fichier a échoué: " + uploadError.message, variant: "destructive" });
            return null;
        }

        const { data: publicUrlData } = supabase.storage.from('conseil_docs').getPublicUrl(data.path);
        return publicUrlData.publicUrl;
    };

    const saveChanges = async () => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            const { data: existingRows } = await supabase.from('conseil_syndical').select('*');

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const updatedRow: any = {
                    position: i, // L'index est répercuté ici garantissant le bon ordre
                    oj_titre: row.oj.titre,
                    oj_date: row.oj.date,
                    oj_type: row.oj.type,
                    cr_titre: row.cr.titre,
                    cr_date: row.cr.date,
                    cr_type: row.cr.type,
                };

                // Handle file uploads OJ
                if (row.oj.type === 'file' && row.oj.fileToUpload) {
                    const url = await handleFileUpload(row.oj.fileToUpload);
                    if (url) updatedRow.oj_url = url;
                } else if (row.oj.type === 'link') {
                    updatedRow.oj_url = row.oj.url;
                } else if (row.oj.type === 'empty') {
                    updatedRow.oj_url = "";
                } else {
                    updatedRow.oj_url = row.oj.url; // Keep existing if file but no new file uploaded
                }

                // Handle file uploads CR
                if (row.cr.type === 'file' && row.cr.fileToUpload) {
                    const url = await handleFileUpload(row.cr.fileToUpload);
                    if (url) updatedRow.cr_url = url;
                } else if (row.cr.type === 'link') {
                    updatedRow.cr_url = row.cr.url;
                } else if (row.cr.type === 'empty') {
                    updatedRow.cr_url = "";
                } else {
                    updatedRow.cr_url = row.cr.url;
                }

                if (row.id.startsWith('temp-')) {
                    const response = await supabase.from('conseil_syndical').insert([updatedRow]).select().single();
                    if (user && !response.error && response.data) {
                        await logAction('Création', user.id, `${user.prenom} ${user.nom}`, user.email, `A créé une ligne de document CS`, null, response.data);
                    }
                } else {
                    const originalRow = existingRows?.find(r => r.id === row.id) || null;
                    const response = await supabase.from('conseil_syndical').update(updatedRow).eq('id', row.id).select().single();
                    if (user && !response.error && response.data) {
                        // Check if something really changed before logging (ignoring updated_at)
                        const originalToCompare = { ...originalRow, updated_at: null };
                        const newToCompare = { ...response.data, updated_at: null };
                        if (JSON.stringify(originalToCompare) !== JSON.stringify(newToCompare)) {
                            await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `A modifié les documents CS`, originalRow, response.data);
                        }
                    }
                }
            }
            toast({ title: "Succès", description: "Les documents du conseil syndical ont été mis à jour." });
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
                        <h1 className="text-3xl font-extrabold text-foreground">Docs du Conseil Syndical</h1>
                        <p className="text-muted-foreground">Gérez les ordres du jour et comptes-rendus. Modifiez par paires (lignes).</p>
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
                                <Button size="sm" variant="destructive" className="h-8 w-8 p-0 rounded-full" onClick={() => removeRow(idx, row.id)} title="Supprimer la ligne entière text-danger">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="font-bold text-lg mb-4 text-foreground opacity-80">Ligne #{idx + 1}</div>

                            <div className="flex flex-col md:flex-row gap-6">
                                <BoxEditor row={row} rowIndex={idx} col="oj" label="Ordre du jour (Colonne Gauche)" handleBoxChange={handleBoxChange} />
                                <BoxEditor row={row} rowIndex={idx} col="cr" label="Compte rendu (Colonne Droite)" handleBoxChange={handleBoxChange} />
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
        </div>
    );
}
