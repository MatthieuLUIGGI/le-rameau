"use client";

import { NotificationBell } from "./NotificationBell";
import { Building2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const getPageTitle = () => {
        if (pathname.includes('/actualites')) return 'Actualités';
        if (pathname.includes('/badges-vigik')) return 'Badges Vigik';
        if (pathname.includes('/syndic')) return 'Syndic';
        if (pathname.includes('/ag')) return 'AG';
        if (pathname.includes('/conseil-syndical')) return 'Conseil Syndical';
        if (pathname.includes('/consultations')) return 'Consultations';
        if (pathname.includes('/contactez-nous')) return 'Contact';
        if (pathname.includes('/profil')) return 'Profil';
        // Legacy routes if not removed
        if (pathname.includes('/evenements')) return 'Événements';
        if (pathname.includes('/alertes')) return 'Alertes';
        if (pathname.includes('/messages')) return 'Messages';
        if (pathname.includes('/contacts')) return 'Contacts';

        return ''; // Dashboard/Accueil is handled differently or left empty
    };

    const title = getPageTitle();

    return (
        <div className="lg:hidden sticky top-0 z-40 bg-surface border-b border-border h-16 flex items-center justify-between px-4">
            <Link href="/accueil" className="flex items-center gap-2 text-primary">
                <Building2 className="h-6 w-6" />
                {/* Only show logo text if there's no page title to prevent cramping */}
                {!title && <span className="font-bold text-lg">Le Rameau</span>}
            </Link>

            {title && <span className="font-semibold text-lg absolute left-1/2 -translate-x-1/2">{title}</span>}

            <NotificationBell />
        </div>
    );
}
