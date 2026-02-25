"use client";

import { Building2, Users, ShieldAlert, Settings, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

const navItems = [
    { href: "/admin", label: "Dashboard Admin", icon: LayoutDashboard },
    { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
    { href: "/admin/annonces", label: "Gestion Annonces", icon: ShieldAlert },
    { href: "/admin/configuration", label: "Configuration", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <div className="w-full md:w-64 bg-[#1e293b] text-white flex flex-col shrink-0 min-h-screen border-r border-border md:fixed">
                <div className="p-6 border-b border-white/10 flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-emerald-400" />
                    <span className="font-bold text-xl tracking-tight">Admin<br /><span className="text-sm text-emerald-400 opacity-80 font-medium">Le Rameau</span></span>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                                    isActive ? "bg-emerald-500/20 text-emerald-400 font-bold" : "text-slate-300 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-emerald-400" : "text-slate-400")} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <Button variant="outline" className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white font-semibold" asChild>
                        <Link href="/accueil">Retour à l'App</Link>
                    </Button>
                </div>
            </div>

            <main className="flex-1 md:ml-64 p-6 sm:p-10 max-w-6xl w-full">
                {children}
            </main>
        </div>
    );
}
