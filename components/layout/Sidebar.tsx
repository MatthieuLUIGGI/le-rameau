"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";
import {
    Home,
    Key,
    Building,
    Newspaper,
    Users,
    Shield,
    MessageSquare,
    Mail,
    LogOut,
    User as UserIcon,
    Building2,
    Sun,
    Moon
} from "lucide-react";
import { useUser } from "../../lib/hooks/useUser";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Skeleton } from "../ui/skeleton";
import { createClient } from "../../lib/supabase/client";
import { toast } from "../../hooks/use-toast";
import { DEMO_MODE } from "../../lib/demo-data";
import { logAction } from "../../lib/logger";

const navigation = [
    { name: 'Accueil', href: '/accueil', icon: Home },
    { name: 'Badges Vigik', href: '/badges-vigik', icon: Key },
    { name: 'Syndic', href: '/syndic', icon: Building },
    { name: 'Actualités', href: '/actualites', icon: Newspaper },
    { name: 'AG', href: '/ag', icon: Users },
    { name: 'Conseil Syndical', href: '/conseil-syndical', icon: Shield },
    { name: 'Consultations', href: '/consultations', icon: MessageSquare },
    { name: 'Contactez-nous', href: '/contactez-nous', icon: Mail },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isLoading } = useUser();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        if (DEMO_MODE) {
            sessionStorage.removeItem("cs_unlocked");
            router.push("/");
            return;
        }
        sessionStorage.removeItem("cs_unlocked");
        const supabase = createClient();

        if (user) {
            await logAction('Déconnexion', user.id, `${user.prenom} ${user.nom}`, user.email);
        }

        await supabase.auth.signOut();
        toast({ title: "Déconnexion réussie" });
        router.push("/");
    };

    return (
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface border-r border-border">
            <div className="flex-1 flex flex-col min-h-0 pt-5 pb-4">
                <div className="flex items-center flex-shrink-0 px-6 font-bold text-2xl text-primary gap-2">
                    <Building2 className="h-8 w-8 text-primary" />
                    Le Rameau
                </div>

                <div className="mt-8 px-6 mb-8 flex items-center">
                    {isLoading ? (
                        <div className="flex items-center space-x-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-3 w-[60px]" />
                            </div>
                        </div>
                    ) : user ? (
                        <div className="flex gap-3 items-center">
                            <Avatar>
                                <AvatarImage src={user.avatar_url || ''} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {user.prenom[0]}{user.nom[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium text-primary">{user.prenom} {user.nom}</p>
                                {user.appartement && <p className="text-xs text-muted-foreground">Apt. {user.appartement}</p>}
                            </div>
                        </div>
                    ) : null}
                </div>

                <nav className="mt-5 flex-1 px-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary',
                                    'group relative flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ease-in-out'
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-xl"
                                        initial={false}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30,
                                        }}
                                    />
                                )}
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-primary',
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200 ease-in-out relative z-10'
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex-shrink-0 flex flex-col border-t border-border p-4 gap-2">
                {mounted && (
                    <Button
                        variant="ghost"
                        className="justify-start text-muted-foreground hover:text-primary w-full"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    >
                        {theme === "dark" ? (
                            <>
                                <Sun className="mr-3 h-5 w-5" />
                                Mode clair
                            </>
                        ) : (
                            <>
                                <Moon className="mr-3 h-5 w-5" />
                                Mode sombre
                            </>
                        )}
                    </Button>
                )}
                {user?.role === "ag" && (
                    <Button variant="ghost" className="justify-start text-primary font-bold hover:text-primary hover:bg-primary/10 w-full" asChild>
                        <Link href="/dashboard">
                            <Shield className="mr-3 h-5 w-5" />
                            Dashboard Admin
                        </Link>
                    </Button>
                )}
                <Button variant="ghost" className="justify-start text-muted-foreground hover:text-primary w-full" asChild>
                    <Link href="/profil">
                        <UserIcon className="mr-3 h-5 w-5" />
                        Mon Profil
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    className="justify-start text-danger hover:text-danger hover:bg-danger/10 w-full"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Déconnexion
                </Button>
            </div>
        </div>
    );
}
