"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { useUser } from "../../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Key, Save, ArrowLeft, Loader2, Info } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logAction } from "../../../../lib/logger";

export default function AdminVigikPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [prix, setPrix] = useState("");
    const [description, setDescription] = useState("");
    const [oldData, setOldData] = useState<any>(null);

    useEffect(() => {
        if (!userLoading && user && user.role !== 'ag') {
            redirect("/accueil");
        }
    }, [user, userLoading]);

    useEffect(() => {
        const fetchVigikInfo = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('vigik_info').select('*').limit(1).single();
            if (!error && data) {
                setPrix(data.prix.toString());
                setDescription(data.description);
                setOldData(data);
            }
            setIsLoading(false);
        };
        fetchVigikInfo();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        const supabase = createClient();

        // Convert comma to dot for decimal parsing if user typed it
        const numericPrix = parseFloat(prix.replace(',', '.'));

        if (isNaN(numericPrix)) {
            toast({ title: "Erreur", description: "Le prix doit être un nombre valide.", variant: "destructive" });
            setIsSaving(false);
            return;
        }

        const { error } = await supabase
            .from('vigik_info')
            .update({ prix: numericPrix, description })
            .eq('id', (await supabase.from('vigik_info').select('id').single()).data?.id); // update first row

        if (error) {
            toast({ title: "Erreur de sauvegarde", description: error.message, variant: "destructive" });
        } else {
            if (user) {
                const newData = { prix: numericPrix, description };
                await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, "Mise à jour des informations Vigik", oldData, newData);
                setOldData({ ...oldData, ...newData }); // update oldData for future saves
            }
            toast({ title: "Modifications enregistrées", description: "Les informations Vigik ont bien été mises à jour." });
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
                    <Key className="h-8 w-8 text-primary" />
                    Configuration Vigik
                </h1>
            </div>
            <p className="text-muted-foreground font-medium text-lg ml-14">
                Administrez la page "Badges Vigik" visible par tous les résidents.
            </p>

            <Card className="bg-surface border-border shadow-md">
                <CardHeader className="bg-muted/10 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-primary" /> Informations affichées
                    </CardTitle>
                    <CardDescription>Mettez à jour le tarif et le texte d'instruction de commande de badge.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">Tarif unitaire (€)</label>
                        <div className="relative max-w-xs">
                            <Input
                                type="text"
                                value={prix}
                                onChange={(e) => setPrix(e.target.value)}
                                className="pl-10 text-lg font-bold"
                                placeholder="ex: 16.00"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">€</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Sera affiché en gros sur la page des résidents.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-foreground">Instructions & Description</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[120px] resize-none"
                            placeholder="Saisissez ici les modalités pour recevoir ou annuler un badge..."
                        />
                        <p className="text-xs text-muted-foreground">Ce texte sert à guider les demandes des résidents.</p>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto font-bold px-8">
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
