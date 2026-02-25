"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Key, Newspaper, Users, Mail } from "lucide-react";
import { cn } from "../../lib/utils";

const tabs = [
    { name: 'Accueil', href: '/accueil', icon: Home },
    { name: 'Actualités', href: '/actualites', icon: Newspaper },
    { name: 'Badges', href: '/badges-vigik', icon: Key },
    { name: 'Contact', href: '/contactez-nous', icon: Mail },
];

export function MobileTabBar() {
    const pathname = usePathname();

    return (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border pb-safe">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors duration-200",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                            )}
                        >
                            <tab.icon className="h-6 w-6 mb-1" />
                            <span className="truncate w-full text-center px-1">{tab.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
