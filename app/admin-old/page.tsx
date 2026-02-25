"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, AlertTriangle, MessageSquare, Newspaper } from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        { title: "Résidents", value: "142", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Alertes actives", value: "2", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
        { title: "Annonces", value: "48", icon: Newspaper, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Canaux", value: "12", icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Panel d'Administration</h1>
                <p className="text-slate-500 font-medium">Gérez votre résidence, vos utilisateurs et supervisez l'activité.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-4 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Derniers Résidents Inscrits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="py-12 text-center text-slate-500 border border-dashed rounded-xl border-slate-200">
                            Liste des utilisateurs récents...
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Dernières Alertes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="py-12 text-center text-slate-500 border border-dashed rounded-xl border-slate-200 bg-red-50/50">
                            Aucune alerte récente.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
