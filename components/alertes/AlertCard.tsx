"use client";

import { Alerte } from "../../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Flame, Droplets, ArrowUpDown, Shield, Zap, AlertCircle } from "lucide-react";

interface AlertCardProps {
    alerte: Alerte;
}

export function AlertCard({ alerte }: AlertCardProps) {
    const getAlertIcon = (category: string) => {
        switch (category) {
            case 'incendie': return <Flame className="h-6 w-6 text-danger" />;
            case 'degat_eau': return <Droplets className="h-6 w-6 text-blue-500" />;
            case 'ascenseur': return <ArrowUpDown className="h-6 w-6 text-warning" />;
            case 'intrusion': return <Shield className="h-6 w-6 text-danger" />;
            case 'coupure': return <Zap className="h-6 w-6 text-yellow-500" />;
            default: return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
        }
    };

    const isEnCours = alerte.statut === 'en_cours';

    return (
        <Card className={`border-l-4 ${isEnCours ? 'bg-danger/5 border-l-danger' : 'bg-surface border-l-success'} shadow-sm`}>
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div className="flex gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm mt-1 h-10 w-10 flex items-center justify-center shrink-0">
                        {isEnCours ? (
                            <div className="animate-pulse">{getAlertIcon(alerte.categorie)}</div>
                        ) : getAlertIcon(alerte.categorie)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {isEnCours ? (
                                <Badge variant="destructive" className="bg-danger text-[10px] animate-pulse">EN COURS</Badge>
                            ) : (
                                <Badge className="bg-success hover:bg-success text-[10px]">RÉSOLU</Badge>
                            )}
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{alerte.categorie.replace('_', ' ')}</span>
                        </div>
                        <CardTitle className={`text-lg transition-colors ${isEnCours ? 'text-danger' : 'text-primary'}`}>
                            {alerte.titre}
                        </CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="ml-14">
                <p className="text-sm/relaxed text-muted-foreground line-clamp-3 mb-4">{alerte.description}</p>

                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs font-medium text-muted-foreground bg-black/5 p-2 rounded-lg">
                    <div>Signalé le {format(new Date(alerte.created_at), "d MMMM à HH:mm", { locale: fr })} par {alerte.auteur?.prenom}</div>
                    {alerte.resolved_at && (
                        <div className="text-success flex items-center gap-1">
                            Résolu le {format(new Date(alerte.resolved_at), "d MMMM à HH:mm", { locale: fr })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
