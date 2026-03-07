"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Loader2, Save, ArrowLeft, Image as ImageIcon, FileText, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import dynamic from "next/dynamic";
import Link from "next/link";
import { logAction } from "../../../../lib/logger";
import { createNotification } from "../../../../lib/notifications";
import { useUser } from "../../../../lib/hooks/useUser";
import { compressImage } from "../../../../lib/compressImage";
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
    const [imageStats, setImageStats] = useState<{ orig: number, comp: number } | null>(null);
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

    const handleImageFile = async (file: File) => {
        if (!file || !file.type.startsWith('image/')) return;

        try {
            const originalSize = file.size;

            // Compression : resizes to max 1200x1200, 85% quality JPG
            const compressedBase64 = await compressImage(file, 1200, 1200, 0.85);

            // Estimate base64 actual size in bytes (approx 3/4 of length minus prefix)
            const prefixIndex = compressedBase64.indexOf(',') + 1;
            const sizeWithoutPrefix = compressedBase64.length - prefixIndex;
            const compressedSize = Math.round(sizeWithoutPrefix * 0.75);

            setFormData(prev => ({ ...prev, image_url: compressedBase64 }));
            setImageStats({ orig: originalSize, comp: compressedSize });

            toast({ title: "Image optimisée", description: "L'image a été compressée pour accélérer le site.", variant: "default" });
        } catch (error) {
            console.error("Erreur de compression:", error);
            toast({ title: "Erreur", description: "Impossible de compresser l'image.", variant: "destructive" });
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " octets";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " Ko";
        return (bytes / (1024 * 1024)).toFixed(2) + " Mo";
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
        let recordId = initialData?.id;

        if (initialData?.id) {
            const res = await supabase.from('actualites').update(payload).eq('id', initialData.id).select('id').single();
            error = res.error;
            if (res.data) recordId = res.data.id;
        } else {
            const res = await supabase.from('actualites').insert([payload]).select('id').single();
            error = res.error;
            if (res.data) recordId = res.data.id;
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
            await createNotification(
                initialData?.id ? "Actualité modifiée" : "Nouvelle actualité",
                formData.titre,
                recordId ? `/actualites/${recordId}` : "/actualites",
                "actualite",
                recordId
            );
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
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image de couverture</label>
                            <div
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) handleImageFile(file);
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => document.getElementById('image-upload')?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                            >
                                {formData.image_url ? (
                                    <div className="relative">
                                        <img src={formData.image_url} alt="Cover Preview" className="w-full h-32 rounded-lg object-cover mb-2" />
                                    </div>
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                )}
                                <p className="text-sm font-medium">Glissez une image ou cliquez</p>
                                <p className="text-xs text-muted-foreground mt-1 text-center">Ou collez une URL ci-dessous</p>
                                <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageFile(file);
                                }} />
                            </div>

                            {imageStats && formData.image_url.startsWith('data:') && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 relative !mt-2">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                        <div className="text-sm w-full">
                                            <p className="font-semibold text-primary">Image optimisée</p>
                                            <div className="flex justify-between items-center text-xs mt-1 bg-background/50 rounded py-1 px-2 border border-border/50">
                                                <span className="text-muted-foreground line-through decoration-danger/50">{formatSize(imageStats.orig)}</span>
                                                <span className="text-muted-foreground">→</span>
                                                <span className="font-bold text-foreground">{formatSize(imageStats.comp)}</span>
                                                <span className="text-success font-bold ml-2">-{Math.round((1 - imageStats.comp / imageStats.orig) * 100)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Input placeholder="https://..." name="image_url" value={formData.image_url} onChange={(e) => { handleChange(e); setImageStats(null); }} />
                            <p className="text-xs text-muted-foreground">URL d'une image en grand format .jpg ou .png</p>
                        </div>
                        <div className="space-y-4">
                            <label className="text-sm font-bold text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Fichier joint (PDF, Word, Excel...)</label>
                            <div
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file && (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('excel') || file.type.includes('spreadsheet') || file.type.includes('officedocument') || file.name.match(/\.(doc|docx|xls|xlsx|pdf)$/i))) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => setFormData(prev => ({ ...prev, pdf_url: event.target?.result as string }));
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => document.getElementById('pdf-upload')?.click()}
                                className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                            >
                                {formData.pdf_url ? (
                                    <div className="bg-primary/10 text-primary font-semibold rounded-lg p-3 mb-2 flex items-center justify-center">
                                        <FileText className="w-6 h-6 mr-2" /> Fichier enregistré
                                    </div>
                                ) : (
                                    <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                )}
                                <p className="text-sm font-medium">Glissez un fichier ou cliquez</p>
                                <p className="text-xs text-muted-foreground mt-1 text-center">Ou collez une URL ci-dessous</p>
                                <input type="file" id="pdf-upload" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => setFormData(prev => ({ ...prev, pdf_url: event.target?.result as string }));
                                        reader.readAsDataURL(file);
                                    }
                                }} />
                            </div>
                            <Input placeholder="https://..." name="pdf_url" value={formData.pdf_url} onChange={handleChange} />
                            <p className="text-xs text-muted-foreground">Si un document (contrat, compte rendu...) est afférent.</p>
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
