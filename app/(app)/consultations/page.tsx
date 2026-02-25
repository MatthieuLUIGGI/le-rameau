"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useUser } from "../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { MessageSquare, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "../../../hooks/use-toast";

interface Option {
    id: string;
    texte: string;
}

interface Consultation {
    id: string;
    question: string;
    options: Option[];
    statut: 'actif' | 'termine';
    created_at: string;
}

export default function ConsultationsPage() {
    const { user, isLoading: userLoading } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [isVoting, setIsVoting] = useState<string | null>(null);
    const [consultations, setConsultations] = useState<Consultation[]>([]);

    // state -> consultation_id: option_id
    const [votes, setVotes] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!userLoading && user) {
            fetchData();
        } else if (!userLoading && !user) {
            // Unauthenticated state shouldn't happen deep in (app) but just in case
            setIsLoading(false);
        }
    }, [user, userLoading]);

    const fetchData = async () => {
        const supabase = createClient();

        // Fetch only active consultations
        const { data: cData } = await supabase.from('consultations').select('*').eq('statut', 'actif').order('created_at', { ascending: false });

        let vData: any = null;
        if (user?.appartement) {
            const res = await supabase.from('consultation_votes').select('consultation_id, option_id').eq('appartement', user.appartement);
            vData = res.data;
        }

        if (cData) setConsultations(cData as Consultation[]);

        if (vData) {
            const votesMap: Record<string, string> = {};
            vData.forEach((v: { consultation_id: string, option_id: string }) => {
                votesMap[v.consultation_id] = v.option_id;
            });
            setVotes(votesMap);
        }

        setIsLoading(false);
    };

    const handleVote = async (consultationId: string, optionId: string) => {
        if (!user || !user.appartement) {
            toast({ title: "Erreur", description: "Vous devez avoir un numéro d'appartement défini dans votre profil pour voter.", variant: "destructive" });
            return;
        }

        setIsVoting(consultationId);
        const supabase = createClient();

        const payload = {
            consultation_id: consultationId,
            user_id: user.id,
            appartement: user.appartement,
            option_id: optionId
        };

        const { error } = await supabase.from('consultation_votes').insert([payload]);

        if (error) {
            // Postgres unique constraint error handling
            if (error.code === '23505') {
                toast({ title: "Vote refusé", description: "Un membre de votre foyer a déjà voté pour cette consultation.", variant: "destructive" });
                // Resync
                fetchData();
            } else {
                toast({ title: "Erreur technique", description: error.message, variant: "destructive" });
            }
        } else {
            toast({ title: "A voté !", description: "Votre choix a bien été enregistré." });
            setVotes(prev => ({ ...prev, [consultationId]: optionId }));
        }

        setIsVoting(null);
    };

    if (userLoading || isLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2 flex items-center gap-3">
                    <MessageSquare className="h-10 w-10 text-primary" />
                    Sondages Résidents
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                    C'est l'heure de donner votre avis. Un seul vote par numéro d'appartement est comptabilisé.
                </p>
                {(!user?.appartement) && (
                    <div className="mt-4 p-4 border border-warning/50 bg-warning/10 text-warning font-semibold rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        Vous devez renseigner votre N° d'appartement dans votre profil pour pouvoir voter.
                    </div>
                )}
            </div>

            {consultations.length === 0 ? (
                <div className="text-center p-12 bg-surface border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground font-medium text-lg">Aucune consultation n'est en cours actuellement.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {consultations.map((consultation) => {
                        const hasVotedOpt = votes[consultation.id];

                        return (
                            <Card key={consultation.id} className={`bg-surface border-border shadow-sm transition-all overflow-hidden relative ${hasVotedOpt ? 'border-primary/50' : ''}`}>
                                {hasVotedOpt && <div className="absolute top-0 left-0 w-2 h-full bg-primary z-10"></div>}

                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <CardTitle className={`text-xl font-bold leading-tight ${hasVotedOpt ? 'text-primary' : 'text-foreground'}`}>
                                            {consultation.question}
                                        </CardTitle>
                                        {hasVotedOpt && (
                                            <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary shrink-0">
                                                <CheckCircle2 className="w-4 h-4" /> Voté
                                            </span>
                                        )}
                                    </div>
                                    {!hasVotedOpt && <CardDescription>Sélectionnez une unique réponse parmi les options ci-dessous.</CardDescription>}
                                </CardHeader>

                                <CardContent className="space-y-3">
                                    {hasVotedOpt ? (
                                        <div className="p-6 bg-muted/20 rounded-xl border border-border text-center space-y-2">
                                            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-2 opacity-50" />
                                            <h3 className="font-bold text-lg text-foreground">Votre vote a été enregistré</h3>
                                            <p className="text-muted-foreground">
                                                Vous avez répondu : <span className="font-bold text-primary">{consultation.options.find(o => o.id === hasVotedOpt)?.texte}</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {consultation.options.map((opt) => (
                                                <Button
                                                    key={opt.id}
                                                    variant="outline"
                                                    className="h-auto py-4 px-6 justify-start text-left font-semibold text-base hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all group"
                                                    onClick={() => handleVote(consultation.id, opt.id)}
                                                    disabled={isVoting === consultation.id || !user?.appartement}
                                                >
                                                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground group-hover:border-primary shrink-0 mr-4 flex items-center justify-center">
                                                        {(isVoting === consultation.id) ? <Loader2 className="w-3 h-3 animate-spin text-primary" /> : <div className="w-2.5 h-2.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                                    </div>
                                                    {opt.texte}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
