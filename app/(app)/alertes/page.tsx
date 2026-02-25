"use client";

import { AlertCard } from "../../../components/alertes/AlertCard";
import { AlertTriggerButton } from "../../../components/alertes/AlertTriggerButton";
import { useAlertes } from "../../../lib/hooks/useAlertes";
import { Skeleton } from "../../../components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { useState, Suspense } from "react";
import { ShieldCheck } from "lucide-react";

export default function AlertesPage() {
    const { alertes, isLoading } = useAlertes();
    const [filter, setFilter] = useState("en_cours");

    const filteredAlertes = filter === "tous"
        ? alertes
        : alertes?.filter(a => a.statut === filter);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="bg-surface p-6 sm:p-10 rounded-3xl border border-border shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-danger/20 via-danger to-danger/20"></div>
                <h1 className="text-3xl font-extrabold text-primary mb-4">Urgences & Incidents</h1>
                <p className="text-muted-foreground font-medium mb-8 max-w-xl mx-auto text-lg leading-relaxed">
                    Signalez un problème grave ou consultez l'état des incidents en cours dans la résidence.
                </p>

                <Suspense fallback={<Skeleton className="h-16 w-full max-w-md mx-auto rounded-xl" />}>
                    <AlertTriggerButton />
                </Suspense>
            </div>

            <div className="flex justify-center mb-8">
                <Tabs value={filter} onValueChange={setFilter} className="w-full max-w-md">
                    <TabsList className="grid w-full grid-cols-3 h-14 bg-surface border border-border rounded-xl p-1 shadow-sm">
                        <TabsTrigger value="en_cours" className="rounded-lg font-bold data-[state=active]:bg-danger data-[state=active]:text-white">En cours</TabsTrigger>
                        <TabsTrigger value="resolu" className="rounded-lg font-bold data-[state=active]:bg-success data-[state=active]:text-white">Résolus</TabsTrigger>
                        <TabsTrigger value="tous" className="rounded-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Tous</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="space-y-4 relative">
                {/* Ligne temporelle décorative */}
                <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-border -z-10 rounded-full hidden sm:block"></div>

                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="pl-0 sm:pl-14"><Skeleton className="h-32 w-full rounded-xl" /></div>
                    ))
                ) : filteredAlertes?.length ? (
                    filteredAlertes.map(alerte => (
                        <div key={alerte.id} className="relative pl-0 sm:pl-14 animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both">
                            <div className="absolute left-[27px] top-6 w-3 h-3 rounded-full bg-border shadow-[0_0_0_4px_white] hidden sm:block"></div>
                            <AlertCard alerte={alerte} />
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center bg-surface/50 border border-border/50 rounded-2xl border-dashed">
                        <div className="bg-success/10 text-success p-6 rounded-full inline-flex mb-4">
                            <ShieldCheck className="h-12 w-12" />
                        </div>
                        <p className="text-xl font-bold text-primary mb-2">Tout va bien !</p>
                        <p className="text-muted-foreground font-medium">Aucun incident à signaler dans cette catégorie.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
