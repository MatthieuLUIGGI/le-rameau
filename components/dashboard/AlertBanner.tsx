"use client";

import { AlertTriangle, ChevronRight, Droplets, ArrowUpDown, Shield, Zap, AlertCircle, Flame } from "lucide-react";
import { useAlertes } from "../../lib/hooks/useAlertes";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

export function AlertBanner() {
    const { alertes, isLoading } = useAlertes();

    if (isLoading) return <Skeleton className="w-full h-16 rounded-xl" />;

    const activeAlerts = alertes?.filter(a => a.statut === 'en_cours');
    if (!activeAlerts?.length) return null;

    const alerte = activeAlerts[0];

    const getAlertIcon = (category: string) => {
        switch (category) {
            case 'incendie': return <Flame className="h-6 w-6 text-danger animate-pulse" />;
            case 'degat_eau': return <Droplets className="h-6 w-6 text-blue-500 animate-pulse" />;
            case 'ascenseur': return <ArrowUpDown className="h-6 w-6 text-warning animate-pulse" />;
            case 'intrusion': return <Shield className="h-6 w-6 text-danger animate-pulse" />;
            case 'coupure': return <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />;
            default: return <AlertCircle className="h-6 w-6 text-muted-foreground animate-pulse" />;
        }
    };

    return (
        <Card className="bg-danger/10 border-danger/20 border-2 overflow-hidden shadow-sm">
            <div className="p-4 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        {getAlertIcon(alerte.categorie)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Urgence</span>
                            <h3 className="font-bold text-danger text-lg">{alerte.titre}</h3>
                        </div>
                        <p className="text-sm text-foreground/80 mt-1 line-clamp-1">{alerte.description}</p>
                    </div>
                </div>
                <Button variant="destructive" size="sm" asChild className="shrink-0">
                    <Link href="/alertes">
                        Voir détails <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                </Button>
            </div>
        </Card>
    );
}
