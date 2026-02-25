"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { Lock, Unlock, Save, Loader2, LayoutDashboard, Users, KeyRound, ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "../../hooks/use-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BoardLayout({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [dbPassword, setDbPassword] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        checkPasswordRequirement();
    }, []);

    const checkPasswordRequirement = async () => {
        // Expiration check (15 minutes)
        const unlockTime = sessionStorage.getItem("admin_board_unlocked_time");
        if (unlockTime) {
            const timeDiff = Date.now() - parseInt(unlockTime, 10);
            if (timeDiff < 15 * 60 * 1000) {
                // Prolongation
                sessionStorage.setItem("admin_board_unlocked_time", Date.now().toString());
                setIsUnlocked(true);
                setIsLoading(false);
                return;
            } else {
                sessionStorage.removeItem("admin_board_unlocked_time");
            }
        }

        const supabase = createClient();
        const { data, error } = await supabase.from('admin_board_password').select('password_value').limit(1).single();

        if (error && error.code === 'PGRST116') {
            setDbPassword(null);
        } else if (data) {
            setDbPassword(data.password_value);
        }

        setIsLoading(false);
    };

    const hashPassword = async (password: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const handleCreatePassword = async () => {
        if (passwordInput.trim() === "") {
            toast({ title: "Erreur", description: "Le mot de passe ne peut pas être vide.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const hashedPassword = await hashPassword(passwordInput);

        const supabase = createClient();
        const { error } = await supabase.from('admin_board_password').insert([{
            password_value: hashedPassword
        }]);

        if (error) {
            console.error("Erreur de création du mot de passe :", error);
            toast({ title: "Erreur", description: error.message || "Impossible de créer le mot de passe, il a peut-être déjà été créé.", variant: "destructive" });
            checkPasswordRequirement();
        } else {
            toast({ title: "Succès", description: "Mot de passe d'administration défini avec succès." });
            sessionStorage.setItem("admin_board_unlocked_time", Date.now().toString());
            setIsUnlocked(true);
        }
        setIsSubmitting(false);
    };

    const handleUnlock = async () => {
        const hashedPassword = await hashPassword(passwordInput);
        if (hashedPassword === dbPassword) {
            sessionStorage.setItem("admin_board_unlocked_time", Date.now().toString());
            setIsUnlocked(true);
            toast({ title: "Accès autorisé", description: "Bienvenue sur le board administrateur." });
        } else {
            toast({ title: "Accès refusé", description: "Le mot de passe est incorrect.", variant: "destructive" });
        }
    };

    if (isLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    if (!isUnlocked) {
        return (
            <div className="max-w-md mx-auto space-y-8 pb-12 pt-12 px-4">
                <Card className="bg-surface border-border shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">Accès Réservé</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {dbPassword === null
                                ? "Aucun mot de passe n'a été défini pour le board admin. Veuillez en créer un."
                                : "Cette page est cachée et protégée. Veuillez entrer le mot de passe."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            type="password"
                            placeholder={dbPassword === null ? "Définir un mot de passe..." : "Entrer le mot de passe..."}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    dbPassword === null ? handleCreatePassword() : handleUnlock();
                                }
                            }}
                            className="text-center text-lg h-12"
                        />
                        <Button
                            className="w-full h-12 font-bold text-lg text-primary-foreground bg-primary hover:bg-primary-light"
                            onClick={dbPassword === null ? handleCreatePassword : handleUnlock}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            ) : dbPassword === null ? (
                                <Save className="w-5 h-5 mr-2" />
                            ) : (
                                <Unlock className="w-5 h-5 mr-2" />
                            )}
                            {dbPassword === null ? "Créer le mot de passe" : "Déverrouiller l'accès"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar Admin */}
            <nav className="border-b border-border bg-surface sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
                    <span className="font-black text-xl text-primary flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Admin Board
                    </span>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex gap-1 h-full items-center text-sm font-semibold">
                        <Link
                            href="/admin/board"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/board' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <LayoutDashboard className="h-4 w-4" /> Vue d'ensemble
                        </Link>
                        <Link
                            href="/admin/board/members"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/board/members' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <Users className="h-4 w-4" /> Membres
                        </Link>
                        <Link
                            href="/admin/board/logs"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname?.startsWith('/admin/board/logs') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <ScrollText className="h-4 w-4" /> Logs
                        </Link>
                        <Link
                            href="/admin/board/password"
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/board/password' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'}`}
                        >
                            <KeyRound className="h-4 w-4" /> Mot de passe
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Contenu principal */}
            <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
