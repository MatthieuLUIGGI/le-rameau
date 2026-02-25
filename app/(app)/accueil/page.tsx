"use client";

import { useUser } from "../../../lib/hooks/useUser";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { WeatherWidget } from "../../../components/dashboard/WeatherWidget";
import { AnnounceFeed } from "../../../components/dashboard/AnnounceFeed";
import { AlertBanner } from "../../../components/dashboard/AlertBanner";
import { QuickActions } from "../../../components/dashboard/QuickActions";
import { Skeleton } from "../../../components/ui/skeleton";
import { useAnnonces } from "../../../lib/hooks/useAnnonces";
import { EventCard } from "../../../components/evenements/EventCard";
import { demoEvenements } from "../../../lib/demo-data"; // Simplify events fetch for dashboard

export default function DashboardPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const today = new Date();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    {isUserLoading ? (
                        <Skeleton className="h-10 w-64 mb-2" />
                    ) : (
                        <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                            Bonjour, {user?.prenom || "Résident"} 👋
                        </h1>
                    )}
                    <p className="text-muted-foreground font-medium capitalize">
                        {format(today, "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                </div>
            </div>

            <AlertBanner />

            <WeatherWidget />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnnounceFeed />

                <div className="flex flex-col h-full bg-surface border border-border shadow-sm rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Prochains événements</h2>
                        <a href="/evenements" className="text-sm font-semibold text-primary hover:text-primary-light">
                            Voir le calendrier
                        </a>
                    </div>
                    <div className="flex-1 flex flex-col gap-4">
                        {demoEvenements.slice(0, 3).map(event => (
                            <EventCard key={event.id} event={event} compact />
                        ))}
                        {demoEvenements.length === 0 && (
                            <div className="text-center py-6 text-muted-foreground flex-1 flex items-center justify-center">
                                Aucun événement prévu
                            </div>
                        )}
                    </div>
                </div>

                <QuickActions />
            </div>
        </div>
    );
}
