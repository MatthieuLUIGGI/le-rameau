"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Phone, Mail, MapPin, UserCheck, Briefcase, Building } from "lucide-react";

interface Syndic {
    nom: string;
    fonction: string;
    photo_url: string;
    telephone: string;
    email: string;
    adresse: string;
    gestionnaire: string;
    assistante: string;
}

interface ConseilSyndical {
    id: string;
    nom: string;
    batiment: string;
    photo_url: string;
}

export default function SyndicPage() {
    const [syndicList, setSyndicList] = useState<Syndic[]>([]);
    const [conseil, setConseil] = useState<ConseilSyndical[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHierarchie = async () => {
            const supabase = createClient();

            // Fetch Niveau 1 : Syndic
            const { data: syndicData } = await supabase.from('syndic').select('*');
            if (syndicData) setSyndicList(syndicData as Syndic[]);

            // Fetch Niveau 2 : Conseil Syndical
            const { data: conseilData } = await supabase.from('membres_conseil_syndical').select('*').order('batiment');
            if (conseilData) setConseil(conseilData as ConseilSyndical[]);

            setIsLoading(false);
        };

        fetchHierarchie();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-12 pt-6 px-4">
            <div className="text-center md:text-left mb-12">
                <h1 className="text-4xl font-extrabold text-primary mb-2">Notre Organisation</h1>
                <p className="text-muted-foreground font-medium text-lg">
                    Découvrez l'équipe du syndic et les membres du conseil syndical représentant la résidence.
                </p>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="space-y-16 relative">
                    {/* Niveau 1 : Le Syndic */}
                    <div className="relative">
                        <div className="flex flex-col items-center">
                            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 shadow-sm relative z-10">
                                Niveau 1 : Le Bureau
                            </span>

                            {syndicList.length > 0 ? syndicList.map((syndic, idx) => (
                                <Card key={idx} className="w-full max-w-3xl bg-surface border-primary/20 shadow-xl overflow-hidden relative z-10 mb-8">
                                    <div className="md:flex">
                                        <div className="md:w-1/3 bg-muted relative h-48 md:h-auto overflow-hidden">
                                            {syndic.photo_url ? (
                                                <img src={syndic.photo_url} alt={syndic.nom} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                                                    <Briefcase className="h-16 w-16 text-primary/40" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 md:p-8 md:w-2/3">
                                            <div className="mb-6">
                                                <h2 className="text-2xl font-black text-foreground">{syndic.nom}</h2>
                                                <p className="text-primary font-bold text-sm tracking-widest uppercase">{syndic.fonction}</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 text-sm">
                                                <div className="flex items-start gap-3">
                                                    <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="text-muted-foreground text-xs block font-semibold uppercase">Gestionnaire</span>
                                                        <span className="font-medium">{syndic.gestionnaire}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <UserCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="text-muted-foreground text-xs block font-semibold uppercase">Assistante</span>
                                                        <span className="font-medium">{syndic.assistante}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    <span className="font-medium py-0.5">{syndic.telephone}</span>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    <span className="font-medium py-0.5 break-all">{syndic.email}</span>
                                                </div>
                                                <div className="flex items-start gap-3 sm:col-span-2 mt-2">
                                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-1" />
                                                    <address className="not-italic font-medium">{syndic.adresse}</address>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <div className="text-center p-8 w-full max-w-3xl border-2 border-dashed border-border rounded-xl z-10 bg-surface">
                                    <p className="text-muted-foreground">Aucun bureau de syndic n'est renseigné.</p>
                                </div>
                            )}
                        </div>

                        {/* Ligne connectrice de hiérarchie */}
                        <div className="absolute top-full left-1/2 w-0.5 h-16 bg-border -translate-x-1/2 hidden md:block z-0"></div>
                    </div>

                    {/* Niveau 2 : Conseil Syndical */}
                    <div className="relative pt-4 md:pt-0">
                        <div className="flex flex-col items-center mb-8">
                            <span className="bg-muted text-foreground px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase shadow-sm relative z-10 border border-border">
                                Niveau 2 : Membres du Conseil Syndical
                            </span>
                        </div>

                        {conseil.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                {conseil.map((membre) => (
                                    <Card key={membre.id} className="bg-surface border-border shadow-sm hover:border-primary/50 transition-colors overflow-hidden flex flex-col items-center text-center p-6 group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-muted group-hover:border-primary/20 transition-colors mb-4 bg-muted">
                                            {membre.photo_url ? (
                                                <img src={membre.photo_url} alt={membre.nom} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCheck className="w-full h-full p-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <h3 className="text-lg font-bold text-foreground mb-1">{membre.nom}</h3>
                                        <div className="flex items-center gap-1.5 text-muted-foreground bg-muted/50 px-3 py-1 rounded-full text-sm font-medium">
                                            <Building className="w-3.5 h-3.5" />
                                            {membre.batiment}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
                                <p className="text-muted-foreground">Aucun membre du conseil syndical n'a encore été ajouté.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
