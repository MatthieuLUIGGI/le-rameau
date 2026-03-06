"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useUser } from "../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Lock, Unlock, Loader2, Save, FileText, ExternalLink, Calendar as CalendarIcon, FileCheck, Link as LinkIcon, Plus } from "lucide-react";
import { toast } from "../../../hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { openBase64Pdf } from "../../../lib/utils";

interface DocCard {
    id: string;
    titre: string;
    date: string;
    type: 'empty' | 'file' | 'link';
    url: string;
    position: number;
}

export default function ConseilSyndicalPage() {
    const { user, isLoading: userLoading } = useUser();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dbPassword, setDbPassword] = useState<string | null>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");

    // Contenu des documents
    const [cards, setCards] = useState<DocCard[]>([]);
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
            setCards(data as DocCard[]);
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

    const DocumentCard = ({ box }: { box: DocCard }) => {
        return (
            <div className={`bg-surface border shadow-sm rounded-xl p-5 flex flex-col gap-3 relative hover:shadow-md transition-all ${(box.type === 'link' || box.type === 'file') && box.url ? 'hover:border-primary/50 group' : ''} ${box.type === 'empty' ? 'border-dashed border-border/50 bg-muted/5 opacity-50 min-h-[100px] justify-center items-center' : ''}`}>
                <div className="space-y-1">
                    <h3 className={`font-bold text-lg leading-tight transition-colors ${(box.type === 'link' || box.type === 'file') && box.url ? 'group-hover:text-primary' : 'text-foreground'} ${box.type === 'empty' ? 'text-muted-foreground text-center' : ''}`}>
                        {box.titre || "Sans titre"}
                        {box.type === 'empty' && !box.titre && "En attente de document"}
                        {box.type === 'empty' && box.titre && " (En attente de document)"}
                    </h3>
                    {box.date && (
                        <div className="flex items-center text-sm text-muted-foreground font-medium gap-1.5 pt-1">
                            <CalendarIcon className="w-4 h-4" />
                            {format(new Date(box.date), "dd MMMM yyyy", { locale: fr })}
                        </div>
                    )}
                </div>

                {box.type === 'file' && box.url && (
                    <div className="mt-auto pt-2">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-blue-100">
                            <FileCheck className="w-5 h-5" /> Ouvrir le document
                        </div>
                    </div>
                )}

                {box.type === 'link' && box.url && (
                    <div className="mt-auto pt-2">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors w-full justify-center border border-primary/20">
                            <ExternalLink className="w-5 h-5" /> Consulter le lien
                        </div>
                    </div>
                )}

                {(box.type === 'link' || box.type === 'file') && box.url && (
                    <div
                        onClick={() => box.type === 'file' ? openBase64Pdf(box.url) : window.open(box.url, "_blank", "noopener,noreferrer")}
                        className="absolute inset-0 z-10 w-full h-full cursor-pointer"
                    ></div>
                )}
            </div>
        );
    };

    // SI DEVERROUILLE, ON AFFICHE LE VRAI CONTENU DU CONSEIL SYNDICAL
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-border mt-6 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-primary to-blue-500"></div>
                <h1 className="text-3xl font-extrabold text-foreground mb-4">Espace du Conseil Syndical</h1>
                <p className="text-muted-foreground font-medium text-lg max-w-2xl mx-auto">
                    Retrouvez ici l'ensemble des documents concernant le conseil syndical.
                </p>
            </div>

            {isLoadingDocs ? (
                <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
            ) : cards.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground font-medium bg-surface rounded-2xl border border-border border-dashed">
                    Aucun document n'a été publié pour le moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {cards.map((card) => (
                        <DocumentCard key={card.id} box={card} />
                    ))}
                </div>
            )}
        </div>
    );
}
