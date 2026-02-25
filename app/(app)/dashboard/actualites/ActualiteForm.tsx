"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Loader2, Save, ArrowLeft, Image as ImageIcon, FileText, Calendar } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import dynamic from "next/dynamic";
import Link from "next/link";
import { logAction } from "../../../../lib/logger";
import { useUser } from "../../../../lib/hooks/useUser";
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false, loading: () => <div className="h-64 flex mt-2 border border-border items-center justify-center bg-muted/20 animate-pulse rounded-md">Chargement Éditeur...</div> });

interface ActualiteFormProps {
    initialData?: {
        id: string;
        titre: string;
        extrait: string;
        contenu: string;
        image_url: string | null;
        pdf_url: string | null;
        priorite: 'basse' | 'normale' | 'haute';
        date_expiration: string | null;
    } | null;
}

export default function ActualiteForm({ initialData }: ActualiteFormProps) {
    const router = useRouter();
    const { user } = useUser();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        titre: "",
        extrait: "",
        contenu: "",
        image_url: "",
        pdf_url: "",
        priorite: "normale" as "basse" | "normale" | "haute",
        date_expiration: ""
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                titre: initialData.titre,
                extrait: initialData.extrait,
                contenu: initialData.contenu,
                image_url: initialData.image_url || "",
                pdf_url: initialData.pdf_url || "",
                priorite: initialData.priorite,
                date_expiration: initialData.date_expiration ? new Date(initialData.date_expiration).toISOString().split('T')[0] : ""
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, contenu: content }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const supabase = createClient();
        const payload = {
            ...formData,
            image_url: formData.image_url.trim() === "" ? null : formData.image_url.trim(),
            pdf_url: formData.pdf_url.trim() === "" ? null : formData.pdf_url.trim(),
            date_expiration: formData.date_expiration ? new Date(formData.date_expiration).toISOString() : null,
        };

        let error;
        if (initialData?.id) {
            const res = await supabase.from('actualites').update(payload).eq('id', initialData.id);
            error = res.error;
        } else {
            const res = await supabase.from('actualites').insert([payload]);
            error = res.error;
        }

        if (error) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
            setIsSaving(false);
        } else {
            if (user) {
                await logAction(
                    initialData?.id ? 'Modification' : 'Création',
                    user.id,
                    `${user.prenom} ${user.nom}`,
                    user.email,
                    `${initialData?.id ? 'A mis à jour' : 'A publié'} l'actualité: ${formData.titre}`,
                    initialData || null,
                    payload
                );
            }
            toast({ title: "Succès", description: "L'actualité a bien été enregistrée." });
            router.push("/dashboard/actualites");
            router.refresh();
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/dashboard/actualites"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <h1 className="text-3xl font-extrabold text-foreground">
                    {initialData ? "Modifier l'actualité" : "Publier une actualité"}
                </h1>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <Card className="bg-surface border-border shadow-md">
                    <CardHeader className="bg-muted/10 border-b border-border/50">
                        <CardTitle>Informations principales</CardTitle>
                        <CardDescription>Titre et extrait visible sur la page d'accueil d'actualités.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-foreground">Titre de l'actualité <span className="text-danger">*</span></label>
                            <Input placeholder="Ex: Début des travaux des bornes de recharge" required name="titre" value={formData.titre} onChange={handleChange} className="font-medium text-lg" />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-foreground">Extrait <span className="text-danger">*</span></label>
                            <Textarea placeholder="Deux ou trois phrases pour résumer l'actualité rapidement..." required name="extrait" value={formData.extrait} onChange={handleChange} className="resize-none" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground">Niveau de Priorité</label>
                            <Select onValueChange={(val: 'basse' | 'normale' | 'haute') => setFormData(prev => ({ ...prev, priorite: val }))} value={formData.priorite}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Priorité" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="basse">Basse (Secondaire)</SelectItem>
                                    <SelectItem value="normale">Normale (Information)</SelectItem>
                                    <SelectItem value="haute">Haute (Important)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Date d'Expiration (Optionnelle)</label>
                            <Input type="date" name="date_expiration" value={formData.date_expiration} onChange={handleChange} />
                            <p className="text-xs text-muted-foreground mt-1">L'actualité restera cachée après cette date.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface border-border shadow-md">
                    <CardHeader className="bg-muted/10 border-b border-border/50">
                        <CardTitle>Contenu Rédactionnel</CardTitle>
                        <CardDescription>Ce contenu s'affichera lorsque l'on cliquera sur "Lire la suite".</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 relative pb-12">
                        <div className="mb-2">
                            <label className="text-sm font-bold text-foreground">Écrivez ou collez votre texte formaté <span className="text-danger">*</span></label>
                        </div>
                        <div className="min-h-[250px] bg-background">
                            <ReactQuill theme="snow" value={formData.contenu} onChange={handleContentChange} className="h-[200px]" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface border-border shadow-md">
                    <CardHeader className="bg-muted/10 border-b border-border/50">
                        <CardTitle>Médias & Pièces Jointes</CardTitle>
                        <CardDescription>Agrémentez votre article avec des illustrations ou fichiers.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Lien de l'image de couverture</label>
                            <Input placeholder="https://..." name="image_url" value={formData.image_url} onChange={handleChange} />
                            <p className="text-xs text-muted-foreground">URL d'une image en grand format .jpg ou .png</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Lien du fichier PDF joint</label>
                            <Input placeholder="https://..." name="pdf_url" value={formData.pdf_url} onChange={handleChange} />
                            <p className="text-xs text-muted-foreground">Si un contrat ou compte rendu est afférent.</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/dashboard/actualites")} disabled={isSaving}>Annuler</Button>
                    <Button type="submit" className="font-bold px-8" disabled={isSaving || formData.contenu.trim() === ""}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {initialData ? "Mettre à jour" : "Le publier maintenant"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
