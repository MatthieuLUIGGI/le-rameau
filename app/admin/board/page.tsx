"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Users, UserCheck, CalendarDays, Loader2 } from "lucide-react";

export default function BoardOverviewPage() {
    const [stats, setStats] = useState({
        total: 0,
        ag: 0,
        recent: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const supabase = createClient();

            // Total profiles
            const { count: totalCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // AG profiles
            const { count: agCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'ag');

            // Inscrits 30 derniers jours
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { count: recentCount } = await supabase.from('profiles')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString());

            setStats({
                total: totalCount || 0,
                ag: agCount || 0,
                recent: recentCount || 0
            });
            setIsLoading(false);
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold text-primary mb-2">Vue d'ensemble</h1>
                <p className="text-muted-foreground font-medium text-lg">
                    Statistiques générales des inscrits sur l'application Le Rameau.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-surface border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Total Inscrits
                        </CardTitle>
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-foreground">{stats.total}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Profils enregistrés au total</p>
                    </CardContent>
                </Card>

                <Card className="bg-surface border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Membres AG
                        </CardTitle>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-foreground">{stats.ag}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Profils avec le rôle "AG"</p>
                    </CardContent>
                </Card>

                <Card className="bg-surface border-border shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                            Nouveaux (30J)
                        </CardTitle>
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <CalendarDays className="w-5 h-5 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-extrabold text-foreground">{stats.recent}</div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">Inscrits les 30 derniers jours</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
