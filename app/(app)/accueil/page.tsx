"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../../lib/hooks/useUser";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "next-themes";

import { Skeleton } from "../../../components/ui/skeleton";
import { Newspaper, Mail, Book, FileText, Download, Users, Key, Landmark, MessageSquare } from "lucide-react";
import Link from "next/link";
import Spline from '@splinetool/react-spline';

export default function DashboardPage() {
    const { user, isLoading: isUserLoading } = useUser();
    const today = new Date();

    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const splineUrl = mounted && resolvedTheme === "dark"
        ? "https://prod.spline.design/CUAqNid-vBww2Hf1/scene.splinecode"
        : "https://prod.spline.design/y0HGR9aPW5BEMAf7/scene.splinecode";

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative min-h-[calc(100vh-140px)] flex flex-col pb-4 lg:pb-0">
            {/* Spline 3D Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-3xl" style={{ opacity: 0.85, maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }}>
                {mounted && <Spline scene={splineUrl} />}
            </div>

            <div className="relative z-10 w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10 w-full mb-6">
                    <div>
                        {isUserLoading ? (
                            <Skeleton className="h-10 w-64 mb-2" />
                        ) : (
                            <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                                Bonjour, {user?.prenom || "Résident"} 👋
                            </h1>
                        )}
                        <p className="text-blue-500 font-medium capitalize">
                            {format(today, "EEEE d MMMM yyyy", { locale: fr })}
                        </p>
                    </div>
                </div>


                {/* Les 4 boutons sortis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                    <Link href="/actualites" className="flex items-center justify-center gap-2 p-4 bg-surface/80 backdrop-blur-md border border-border hover:bg-muted/50 rounded-xl transition-colors shadow-sm font-semibold text-primary">
                        <Newspaper className="h-5 w-5" />
                        <span className="truncate">Actualités</span>
                    </Link>
                    <Link href="/contactez-nous" className="flex items-center justify-center gap-2 p-4 bg-surface/80 backdrop-blur-md border border-border hover:bg-muted/50 rounded-xl transition-colors shadow-sm font-semibold text-blue-500">
                        <Mail className="h-5 w-5" />
                        <span className="truncate">Nous contacter</span>
                    </Link>
                    <a href="/livret-accueil.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-surface/80 backdrop-blur-md border border-border hover:bg-muted/50 rounded-xl transition-colors shadow-sm font-semibold text-green-600">
                        <Book className="h-5 w-5" />
                        <span className="truncate">Livret d'accueil</span>
                    </a>
                    <a href="/reglement-copropriete.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-4 bg-surface/80 backdrop-blur-md border border-border hover:bg-muted/50 rounded-xl transition-colors shadow-sm font-semibold text-orange-500">
                        <FileText className="h-5 w-5" />
                        <span className="truncate">Règlement</span>
                    </a>
                </div>
            </div>

            {/* Nouvelle section Accès rapides */}
            <div className="mt-auto pt-16 relative z-10">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-1">Accès rapides</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full">
                    {/* Card 1: Actualités */}
                    <Link href="/actualites" className="group flex flex-col p-4 bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-300 hover:border-primary/50">
                        <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                            <Newspaper className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-base font-bold mb-1 group-hover:text-primary transition-colors">Actualités</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Restez informé des dernières nouvelles de la copropriété</p>
                    </Link>

                    {/* Card 2: Syndic */}
                    <Link href="/syndic" className="group flex flex-col p-4 bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-300 hover:border-blue-500/50">
                        <div className="bg-blue-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-500/20 transition-colors">
                            <Users className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="text-base font-bold mb-1 group-hover:text-blue-500 transition-colors">Syndic</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Gestion syndicale et contacts utiles</p>
                    </Link>

                    {/* Card 3: Badges Vigik */}
                    <Link href="/badges-vigik" className="group flex flex-col p-4 bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-300 hover:border-amber-500/50">
                        <div className="bg-amber-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-colors">
                            <Key className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="text-base font-bold mb-1 group-hover:text-amber-500 transition-colors">Badges Vigik</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Gérez vos accès et vos badges électroniques</p>
                    </Link>

                    {/* Card 4: Assemblées Générales */}
                    <Link href="/ag" className="group flex flex-col p-4 bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-300 hover:border-purple-500/50">
                        <div className="bg-purple-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                            <Landmark className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="text-base font-bold mb-1 group-hover:text-purple-500 transition-colors">Assemblées Générales</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Accédez aux comptes rendus des assemblées générales</p>
                    </Link>

                    {/* Card 5: Conseil Syndical */}
                    <Link href="/conseil-syndical" className="group flex flex-col p-4 bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-300 hover:border-emerald-500/50">
                        <div className="bg-emerald-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                            <Users className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="text-base font-bold mb-1 group-hover:text-emerald-500 transition-colors">Conseil Syndical</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Informations et comptes rendus du conseil syndical</p>
                    </Link>

                    {/* Card 6: Consultations */}
                    <Link href="/consultations" className="group flex flex-col p-4 bg-surface/80 backdrop-blur-md border border-border shadow-sm hover:shadow-md hover:-translate-y-1 rounded-xl transition-all duration-300 hover:border-pink-500/50">
                        <div className="bg-pink-500/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-pink-500/20 transition-colors">
                            <MessageSquare className="h-5 w-5 text-pink-500" />
                        </div>
                        <h3 className="text-base font-bold mb-1 group-hover:text-pink-500 transition-colors">Consultations</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">Participez aux consultations et exprimez votre opinion</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
