"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useUser } from "../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Lock, Unlock, Loader2, Save, FileText, ExternalLink, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DocumentBox {
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
}

interface ConseilRow {
    id: string;
    position: number;
    oj: DocumentBox;
    cr: DocumentBox;
}

export default function ConseilSyndicalPage() {
    const { user, isLoading: userLoading } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dbPassword, setDbPassword] = useState<string | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");

    // Contenu des documents
    const [rows, setRows] = useState<ConseilRow[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(false);

    // Vérifier l'état au montage
    useEffect(() => {
        if (!userLoading && user) {
            checkPasswordRequirement();
        } else if (!userLoading && !user) {
            setIsLoading(false);
        }
    }, [user, userLoading]);

    const checkPasswordRequirement = async () => {
        // Supprimer l'ancienne version de la session si elle existe
        sessionStorage.removeItem("cs_unlocked");

        // Vérifier si le mot de passe a été entré il y a moins de 15 minutes
        const unlockTime = sessionStorage.getItem("cs_unlocked_time");
        if (unlockTime) {
            const timeDiff = Date.now() - parseInt(unlockTime, 10);
            if (timeDiff < 15 * 60 * 1000) { // 15 minutes d'expiration
                // Renouveler la durée pour rester déverrouillé tant qu'on navigue
                sessionStorage.setItem("cs_unlocked_time", Date.now().toString());
                setIsUnlocked(true);
                setIsLoading(false);
                return;
            } else {
                // Le temps est écoulé, on nettoie
                sessionStorage.removeItem("cs_unlocked_time");
            }
        }

        const supabase = createClient();
        const { data, error } = await supabase.from('conseil_password').select('password_value').eq('page_name', 'conseil_syndical').single();

        if (error && error.code === 'PGRST116') {
            setDbPassword(null);
        } else if (data) {
            setDbPassword(data.password_value);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        if (isUnlocked) {
            fetchDocuments();
        }
    }, [isUnlocked]);

    const fetchDocuments = async () => {
        setIsLoadingDocs(true);
        const supabase = createClient();
        const { data, error } = await supabase.from('conseil_syndical').select('*').order('position', { ascending: true });

        if (data && data.length > 0) {
            setRows(data.map(d => ({
                id: d.id,
                position: d.position,
                oj: { titre: d.oj_titre || '', date: d.oj_date || '', type: d.oj_type || 'empty', url: d.oj_url || '' },
                cr: { titre: d.cr_titre || '', date: d.cr_date || '', type: d.cr_type || 'empty', url: d.cr_url || '' }
            })));
        }
        setIsLoadingDocs(false);
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
        const { error } = await supabase.from('conseil_password').insert([{
            page_name: 'conseil_syndical',
            password_value: hashedPassword
        }]);

        if (error) {
            toast({ title: "Erreur", description: "Impossible de créer le mot de passe, il a peut-être déjà été créé par quelqu'un d'autre.", variant: "destructive" });
            // re-fetch pour voir si quelqu'un d'autre l'a créé entre temps
            checkPasswordRequirement();
        } else {
            toast({ title: "Succès", description: "Mot de passe défini avec succès." });
            sessionStorage.setItem("cs_unlocked_time", Date.now().toString());
            setIsUnlocked(true);
        }
        setIsSubmitting(false);
    };

    const handleUnlock = async () => {
        const hashedPassword = await hashPassword(passwordInput);
        if (hashedPassword === dbPassword) {
            sessionStorage.setItem("cs_unlocked_time", Date.now().toString());
            setIsUnlocked(true);
            toast({ title: "Accès autorisé", description: "Bienvenue sur l'espace du Conseil Syndical." });
        } else {
            toast({ title: "Accès refusé", description: "Le mot de passe est incorrect.", variant: "destructive" });
        }
    };

    if (userLoading || isLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    // Si pas déverrouillé, on affiche la page de protection
    if (!isUnlocked) {
        return (
            <div className="max-w-md mx-auto space-y-8 pb-12 pt-12 px-4">
                <Card className="bg-surface border-border shadow-lg">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-foreground">Espace Sécurisé</CardTitle>
                        <CardDescription className="text-base mt-2">
                            {dbPassword === null
                                ? "Aucun mot de passe n'a été défini pour cet espace. Veuillez en créer un."
                                : "Cette page est protégée. Veuillez entrer le mot de passe du Conseil Syndical."}
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
                                    if (dbPassword === null) {
                                        handleCreatePassword();
                                    } else {
                                        handleUnlock();
                                    }
                                }
                            }}
                            className="text-center text-lg h-12"
                        />
                        <Button
                            className="w-full h-12 font-bold text-lg"
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

    const DocumentCard = ({ box, label }: { box: DocumentBox, label: string }) => {
        if (box.type === 'empty') {
            return (
                <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5 opacity-50">
                    <span className="text-sm font-medium text-muted-foreground">{label} : En attente</span>
                </div>
            );
        }

        const isLink = box.type === 'link';

        return (
            <a
                href={box.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 group bg-surface hover:bg-muted/30 border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center sm:items-start text-center sm:text-left gap-3 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    {isLink ? <ExternalLink className="w-16 h-16 -mt-2 -mr-2 text-primary" /> : <FileText className="w-16 h-16 -mt-2 -mr-2 text-primary" />}
                </div>

                <div className="bg-primary/10 text-primary p-3 rounded-xl mb-1">
                    {isLink ? <ExternalLink className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                </div>

                <div className="space-y-1 relative z-10 w-full">
                    <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                        {box.titre || label}
                    </h3>
                    <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground font-medium gap-1.5 pt-1">
                        <CalendarIcon className="w-4 h-4" />
                        {box.date ? format(new Date(box.date), "dd MMMM yyyy", { locale: fr }) : "Date non spécifiée"}
                    </div>
                </div>
            </a>
        );
    };

    // SI DEVERROUILLE, ON AFFICHE LE VRAI CONTENU DU CONSEIL SYNDICAL
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-border mt-6 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-primary to-blue-500"></div>
                <h1 className="text-3xl font-extrabold text-foreground mb-4">Espace du Conseil Syndical</h1>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
                    Retrouvez ici les ordres du jour et les comptes-rendus des réunions de votre conseil syndical.
                </p>
            </div>

            {isLoadingDocs ? (
                <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : rows.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-medium bg-surface rounded-2xl border border-border border-dashed">
                    Aucun document n'a été publié pour le moment.
                </div>
            ) : (
                <div className="space-y-6">
                    {rows.map((row, idx) => (
                        <div key={row.id} className="relative bg-background border border-border/60 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row items-stretch gap-6">
                                <DocumentCard box={row.oj} label="Ordre du jour" />

                                <div className="hidden md:flex flex-col items-center justify-center">
                                    <div className="w-px h-16 bg-border"></div>
                                    <div className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full my-2">ET</div>
                                    <div className="w-px h-16 bg-border"></div>
                                </div>
                                <div className="flex md:hidden items-center justify-center w-full">
                                    <div className="h-px w-16 bg-border"></div>
                                    <div className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1 rounded-full mx-2">ET</div>
                                    <div className="h-px w-16 bg-border"></div>
                                </div>

                                <DocumentCard box={row.cr} label="Compte rendu" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
