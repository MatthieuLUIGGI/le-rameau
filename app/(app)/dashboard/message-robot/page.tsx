"use client";

import { useUser } from "../../../../lib/hooks/useUser";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Label } from "../../../../components/ui/label";
import { Bot, Save } from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { DEMO_MODE } from "../../../../lib/demo-data";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MessageRobotPage() {
    const { user, isLoading } = useUser();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    const [message, setMessage] = useState("Bienvenue sur le site de la Copropriété");
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const supabase = createClient();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                redirect("/login");
            } else if (user.role !== 'ag' && !DEMO_MODE) {
                redirect("/accueil");
            } else {
                setAuthorized(true);
                fetchMessage();
            }
        }
    }, [user, isLoading]);

    const fetchMessage = async () => {
        try {
            const { data, error } = await supabase
                .from('spline_message')
                .select('*')
                .eq('id', '00000000-0000-0000-0000-000000000001')
                .single();

            if (data) {
                setMessage(data.message);
                setIsActive(data.is_active);
            }
        } catch (err) {
            console.error("Error fetching message:", err);
        }
    };

    const handleSave = async () => {
        if (DEMO_MODE) {
            setFeedback({ type: 'error', message: "Mode démo : les modifications ne sont pas enregistrées." });
            return;
        }

        setSaving(true);
        setFeedback(null);

        try {
            const { error } = await supabase
                .from('spline_message')
                .update({ 
                    message: message, 
                    is_active: isActive,
                    updated_at: new Date().toISOString()
                })
                .eq('id', '00000000-0000-0000-0000-000000000001');

            if (error) throw error;
            setFeedback({ type: 'success', message: "Le message a été mis à jour avec succès." });
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'error', message: "Erreur lors de la sauvegarde." });
        } finally {
            setSaving(false);
        }
    };

    if (!authorized) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div>
                <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au Dashboard
                </Link>
                <h1 className="text-4xl font-extrabold text-primary mb-2 flex items-center gap-3">
                    <Bot className="h-10 w-10 text-primary" />
                    Message du Robot
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                    Configurez le message affiché par le robot sur la page d'accueil (ex: alerte coupure d'eau).
                </p>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader>
                    <CardTitle>Configuration de la bulle de discussion</CardTitle>
                    <CardDescription>
                        Ce message s'affichera dans une bulle de style bande dessinée à côté du robot sur la page principale.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="message">Message affiché</Label>
                        <Textarea 
                            id="message" 
                            placeholder="Exemple : Coupure d'eau prévue demain de 9h à 12h." 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={!isActive}
                            rows={4}
                            className={!isActive ? "opacity-50" : ""}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            S'il n'y a pas d'alerte, vous pouvez rédiger "Bienvenue sur le site de la Copropriété".
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg bg-surface/50">
                        <Checkbox 
                            id="is_active" 
                            checked={isActive} 
                            onCheckedChange={(checked) => setIsActive(checked === true)} 
                        />
                        <div className="space-y-1 leading-none">
                            <Label htmlFor="is_active" className="font-medium cursor-pointer">
                                Afficher le message personnalisé
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Si décoché, le robot affichera par défaut "Bienvenue sur le site de la Copropriété".
                            </p>
                        </div>
                    </div>

                    {feedback && (
                        <div className={`p-4 rounded-md text-sm font-medium ${
                            feedback.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                            {feedback.message}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t bg-muted/20 px-6 py-4">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">Annuler</Link>
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? "Sauvegarde..." : "Enregistrer"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="mt-8 rounded-xl overflow-hidden border bg-surface/50 p-8 flex justify-center items-center">
                <div className="text-sm text-center">
                    <h3 className="font-bold text-muted-foreground mb-4">Aperçu du message</h3>
                    <div className={`relative p-4 inline-block text-left rounded-2xl shadow-xl text-sm lg:text-base font-bold min-w-[250px]
                        ${(isActive && message !== "Bienvenue sur le site de la Copropriété") ? 'bg-red-500 text-white border-red-400' : 'bg-white text-slate-900 border-gray-200 border'}
                    `}>
                        {isActive ? message : "Bienvenue sur le site de la Copropriété"}
                        <div className="absolute -bottom-3 left-1/4 w-0 h-0 
                            border-l-[12px] border-l-transparent 
                            border-t-[16px] border-r-[12px] border-r-transparent transform -rotate-12"
                            style={{ borderTopColor: (isActive && message !== "Bienvenue sur le site de la Copropriété") ? '#ef4444' : '#ffffff' }}>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
