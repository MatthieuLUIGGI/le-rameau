"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Loader2, Plus, Trash2, GripVertical, FileCheck, UploadCloud, Link as LinkIcon, Save, ArrowLeft, Users } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logAction } from "../../../../lib/logger";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DocCard {
    id: string;
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
    position: number;
    fileToUpload?: File | null;
    isSaving?: boolean;
}

function SortableItem({ id, item, updateItem, handleDelete, handleSave, handleFileDrop }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, setActivatorNodeRef, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 1, position: 'relative' as const };

    return (
        <div ref={setNodeRef} style={style} className={`bg-surface border shadow-sm rounded-xl p-3 flex flex-col gap-3 ${isDragging ? 'opacity-50 shadow-xl border-primary' : ''}`}>
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
                <div ref={setActivatorNodeRef} {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-muted p-1.5 rounded-md transition-colors">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleSave(item)} disabled={item.isSaving} className="h-8">
                        {item.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Enregistrer
                    </Button>
                    <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)} className="h-8 w-8 hover:bg-red-600">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col">
                <Input placeholder="Titre de la case..." value={item.titre} onChange={e => updateItem(id, 'titre', e.target.value)} className="font-semibold text-lg" />
                <Input type="date" value={item.date} onChange={e => updateItem(id, 'date', e.target.value)} />

                <div
                    className={`relative border-2 border-dashed rounded-lg p-2 text-center transition-colors flex flex-col items-center justify-center min-h-[4rem] overflow-hidden ${item.type === 'file' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileDrop(id, e.dataTransfer.files[0]);
                    }}
                >
                    {item.fileToUpload ? (
                        <div className="text-sm font-medium text-green-600 flex flex-col items-center gap-1">
                            <FileCheck className="w-6 h-6" /> <span className="line-clamp-1 break-all px-2">{item.fileToUpload.name}</span>
                        </div>
                    ) : item.type === 'file' && item.url ? (
                        <div className="text-sm font-medium text-blue-500 flex flex-col items-center gap-1">
                            <FileCheck className="w-6 h-6" /> <span>Fichier enregistré en ligne</span>
                        </div>
                    ) : (
                        <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                            <Plus className="w-6 h-6 shrink-0 opacity-50" />
                            <span>Glissez un PDF / Fichier ou ajouter un lien</span>
                        </div>
                    )}
                    <input type="file" className="absolute w-full h-full opacity-0 cursor-pointer inset-0" onChange={e => e.target.files && handleFileDrop(id, e.target.files[0])} />
                </div>

                <div className="relative mt-auto pt-2">
                    <div className="absolute inset-x-0 -top-2 flex justify-center">
                        <span className="bg-surface px-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Ou</span>
                    </div>
                    <LinkIcon className="absolute left-3 top-1/2 translate-y-[2px] w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Coller un lien URL..." className="pl-9 text-sm h-9" value={item.type === 'link' ? item.url : ''} onChange={e => updateItem(id, 'url', e.target.value)} />
                </div>
            </div>
        </div>
    );
}

export default function AdminAGPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [cards, setCards] = useState<DocCard[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    useEffect(() => {
        if (!userLoading && user && user.role !== 'ag') redirect("/accueil");
    }, [user, userLoading]);

    useEffect(() => {
        if (!userLoading && user?.role === 'ag') fetchCards();
    }, [user, userLoading]);

    const fetchCards = async () => {
        const supabase = createClient();
        const { data, error } = await supabase.from('assemblee_generale').select('*').order('position', { ascending: true });

        if (!error && data) {
            setCards(data.map(d => ({ ...d, fileToUpload: null, isSaving: false })));
        }
        setIsLoading(false);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCards((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                saveOrder(newOrder); // trigger async save
                return newOrder.map((item, idx) => ({ ...item, position: idx }));
            });
        }
    };

    const saveOrder = async (newOrder: DocCard[]) => {
        const supabase = createClient();
        const updates = newOrder.map((item, idx) => ({ id: item.id, position: idx }));
        await supabase.from('assemblee_generale').upsert(updates);
        if (user) await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, 'Réorganisation AG');
    };

    const addCard = async () => {
        const supabase = createClient();
        const minPosition = cards.length > 0 ? Math.min(...cards.map(c => c.position)) : 0;
        const newPos = minPosition - 1;
        const { data, error } = await supabase.from('assemblee_generale').insert([{ titre: '', date: '', type: 'empty', url: '', position: newPos }]).select().single();
        if (data) setCards([{ ...data, fileToUpload: null, isSaving: false }, ...cards]);
        if (user) await logAction('Création', user.id, `${user.prenom} ${user.nom}`, user.email, 'Ajout case AG');
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette case ?")) return;
        const supabase = createClient();
        await supabase.from('assemblee_generale').delete().eq('id', id);
        setCards(cards.filter(c => c.id !== id));
        if (user) await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, 'Suppression case AG');
    };

    const updateItem = (id: string, field: string, value: any) => {
        setCards(cards.map(c => {
            if (c.id !== id) return c;
            const updated = { ...c, [field]: value };
            if (field === 'url' && value.trim().length > 0) updated.type = 'link';
            else if (field === 'url' && value.trim().length === 0 && !c.fileToUpload) updated.type = 'empty';
            return updated;
        }));
    };

    const handleFileDrop = (id: string, file: File) => {
        setCards(cards.map(c => c.id === id ? { ...c, fileToUpload: file, type: 'file', url: '' } : c));
    };

    const handleSave = async (card: DocCard) => {
        setCards(cards.map(c => c.id === card.id ? { ...c, isSaving: true } : c));
        let urlTarget = card.url;
        const supabase = createClient();

        if (card.fileToUpload) {
            try {
                // Read as base64 instead of storage for demo logic compatibility
                const buffer = await card.fileToUpload.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                const contentType = card.fileToUpload.type;
                urlTarget = `data:${contentType};base64,${base64}`;
            } catch (err) {
                toast({ title: "Erreur d'attachement", description: "Le fichier n'a pas pu être traité." });
            }
        }

        const { error } = await supabase.from('assemblee_generale').update({
            titre: card.titre,
            date: card.date,
            type: card.type,
            url: urlTarget
        }).eq('id', card.id);

        if (!error) {
            toast({ title: "Case enregistrée" });
            setCards(cards.map(c => c.id === card.id ? { ...c, isSaving: false, fileToUpload: null, url: urlTarget } : c));
            if (user) await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, `Mise à jour case AG: ${card.titre}`);
        } else {
            setCards(cards.map(c => c.id === card.id ? { ...c, isSaving: false } : c));
            toast({ title: "Erreur", description: "Sauvegarde impossible", variant: "destructive" });
        }
    };

    if (isLoading || userLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild className="rounded-full">
                        <Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link>
                    </Button>
                    <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Gestion AG
                    </h1>
                </div>
                <Button onClick={addCard} className="font-bold shadow-md rounded-full px-6">
                    <Plus className="w-5 h-5 mr-2" /> Ajouter une case
                </Button>
            </div>

            <div className="mt-8">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {cards.map((card) => (
                                <SortableItem key={card.id} id={card.id} item={card} updateItem={updateItem} handleDelete={handleDelete} handleSave={handleSave} handleFileDrop={handleFileDrop} />
                            ))}
                            {Array.from({ length: Math.max(0, 6 - cards.length) }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    onClick={addCard}
                                    className="bg-surface/50 border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 cursor-pointer rounded-xl flex items-center justify-center min-h-[220px] transition-all group"
                                >
                                    <div className="bg-primary/10 text-primary p-4 rounded-full group-hover:scale-110 transition-transform">
                                        <Plus className="w-8 h-8" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}
