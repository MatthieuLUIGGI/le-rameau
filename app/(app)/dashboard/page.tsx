"use client";

import { useUser } from "../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { ShieldCheck, Users, Megaphone, FileText, Building, Key, MessageSquare } from "lucide-react";
import { DEMO_MODE } from "../../../lib/demo-data";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
    const { user, isLoading } = useUser();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                redirect("/login");
            } else if (user.role !== 'ag' && !DEMO_MODE) {
                redirect("/accueil");
            } else {
                setAuthorized(true);
            }
        }
    }, [user, isLoading]);

    if (!authorized) {
        return (
            <div className="flex items-center justify-center p-12">
                <ShieldCheck className="w-12 h-12 text-primary animate-pulse" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2 flex items-center gap-3">
                    <ShieldCheck className="h-10 w-10 text-primary" />
                    Dashboard Conseil
                </h1>
                <p className="text-muted-foreground font-medium text-lg">
                    Espace d'administration réservé aux membres de l'Assemblée Générale.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link href="/dashboard/badges-vigik" className="block group">
                    <Card className="bg-surface border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Key className="w-16 h-16 -mt-2 -mr-2 text-primary" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Key className="h-5 w-5" />
                                </div>
                                Configuration Vigik
                            </CardTitle>
                            <CardDescription className="pt-2">
                                Modifier le tarif unitaire actuel et les instructions pour les badges.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/syndic" className="block group">
                    <Card className="bg-surface border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Building className="w-16 h-16 -mt-2 -mr-2 text-primary" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Building className="h-5 w-5" />
                                </div>
                                Gestion Syndic
                            </CardTitle>
                            <CardDescription className="pt-2">
                                Gérer les informations du bureau et les membres du conseil syndical.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/actualites" className="block group">
                    <Card className="bg-surface border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Megaphone className="w-16 h-16 -mt-2 -mr-2 text-primary" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Megaphone className="h-5 w-5" />
                                </div>
                                Gestion Actualités
                            </CardTitle>
                            <CardDescription className="pt-2">
                                Publier, modifier ou supprimer des annonces et nouveautés.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/ag" className="block group">
                    <Card className="bg-surface border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FileText className="w-16 h-16 -mt-2 -mr-2 text-primary" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <FileText className="h-5 w-5" />
                                </div>
                                Assemblée Générale
                            </CardTitle>
                            <CardDescription className="pt-2">
                                Gérer les PV et rapports d'activité.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/conseil-syndical" className="block group">
                    <Card className="bg-surface border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="w-16 h-16 -mt-2 -mr-2 text-primary" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                Conseil Syndical
                            </CardTitle>
                            <CardDescription className="pt-2">
                                Gérer les ordres du jour et comptes-rendus du conseil.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/consultations" className="block group">
                    <Card className="bg-surface border-border shadow-sm group-hover:shadow-md group-hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MessageSquare className="w-16 h-16 -mt-2 -mr-2 text-primary" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                Consultations
                            </CardTitle>
                            <CardDescription className="pt-2">
                                Créer des sondages pour recueillir l'avis des résidents.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
