"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { KeyRound, Save, Loader2 } from "lucide-react";
import { toast } from "../../../../hooks/use-toast";
import { Label } from "../../../../components/ui/label";

export default function BoardPasswordPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hashPassword = async (password: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ title: "Erreur", description: "Le nouveau mot de passe et la confirmation ne correspondent pas.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const supabase = createClient();

        // 1. Fetch current stored password
        const { data, error } = await supabase.from('admin_board_password').select('id, password_value').limit(1).single();

        if (error || !data) {
            toast({ title: "Erreur", description: "Impossible de vérifier le mot de passe actuel.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        // 2. Hash and compare current input
        const hashedCurrent = await hashPassword(currentPassword);
        if (hashedCurrent !== data.password_value) {
            toast({ title: "Erreur", description: "Le mot de passe actuel est incorrect.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        // 3. Hash and store new password
        const hashedNew = await hashPassword(newPassword);
        const { error: updateError } = await supabase.from('admin_board_password')
            .update({ password_value: hashedNew })
            .eq('id', data.id);

        if (updateError) {
            toast({ title: "Erreur", description: "Erreur lors de la mise à jour du mot de passe.", variant: "destructive" });
        } else {
            toast({ title: "Succès", description: "Le mot de passe du board a été modifié avec succès." });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        }

        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-primary mb-2">Mot de passe du Board</h1>
                <p className="text-muted-foreground font-medium text-lg">
                    Modifiez le mot de passe de protection de la page /admin/board.
                </p>
            </div>

            <Card className="bg-surface border-border shadow-md">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                        <KeyRound className="h-6 w-6 text-primary" /> Modifier le mot de passe
                    </CardTitle>
                    <CardDescription className="text-sm font-medium">
                        Ce mot de passe est partagé à tous ceux qui doivent avoir accès à la vue d'ensemble du Board Admin. Assurez-vous d'utiliser un mot de passe sécurisé.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="current" className="text-sm font-bold text-foreground">Mot de passe actuel</Label>
                            <Input
                                id="current"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-background h-12 text-lg"
                                placeholder="Entrez le mot de passe actuel..."
                            />
                        </div>

                        <div className="space-y-2 border-t border-border pt-6 mt-6">
                            <Label htmlFor="new" className="text-sm font-bold text-foreground">Nouveau mot de passe</Label>
                            <Input
                                id="new"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-background h-12 text-lg"
                                placeholder="Nouveau mot de passe..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-sm font-bold text-foreground">Confirmer le nouveau mot de passe</Label>
                            <Input
                                id="confirm"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="bg-background h-12 text-lg"
                                placeholder="Répétez le nouveau mot de passe..."
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 font-bold text-lg bg-primary hover:bg-primary-light text-primary-foreground shadow-sm group transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-current" />
                            ) : (
                                <><Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Mettre à jour le mot de passe</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
