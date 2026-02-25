"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Key, Info, ShieldAlert, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function BadgesVigikPage() {
    const [vigikInfo, setVigikInfo] = useState<{ prix: number, description: string } | null>(null);

    useEffect(() => {
        const fetchVigikInfo = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('vigik_info').select('*').limit(1).single();
            if (!error && data) {
                setVigikInfo(data as any);
            }
        };
        fetchVigikInfo();
    }, []);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary mb-2">Badges Vigik</h1>
                    <p className="text-muted-foreground font-medium text-lg">Informations sur les accès électroniques à la résidence.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-surface border-border shadow-md h-full">
                    <CardHeader className="border-b border-border bg-muted/20 pb-4">
                        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
                            <Info className="h-5 w-5" /> Informations pratiques
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-lg text-foreground">Tarif unitaire</span>
                            {vigikInfo ? (
                                <span className="text-2xl font-black text-primary">{vigikInfo.prix.toFixed(2).replace('.', ',')} €</span>
                            ) : (
                                <span className="w-20 h-8 bg-muted animate-pulse rounded"></span>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-bold text-foreground">Si vous avez besoin d'un nouveau badge :</h3>
                            <p className="text-muted-foreground font-medium bg-muted p-4 rounded-lg">
                                Faites la demande au Syndic via la page de contact.
                            </p>
                            {vigikInfo && (
                                <p className="text-sm text-foreground/70 italic mt-2">
                                    {vigikInfo.description}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="bg-danger/5 border-danger/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <ShieldAlert className="w-24 h-24 -mt-4 -mr-4 text-danger" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold text-danger flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" /> En cas de perte
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-foreground/80 font-medium text-sm leading-relaxed relative z-10">
                            <p>
                                Merci de nous signaler sa perte dans l'onglet <strong>"Contactez-nous"</strong> en précisant impérativement le numéro gravé sur le badge.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Key className="w-32 h-32 -mt-8 -mr-8" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <h3 className="font-bold text-xl mb-3 flex items-center gap-2">Conseil de sécurité</h3>
                            <p className="text-slate-200 font-medium leading-relaxed text-sm">
                                Prenez vos badges en photo ou conservez leurs numéros sur un document de votre choix facilement accessible.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
