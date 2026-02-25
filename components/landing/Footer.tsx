import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-primary dark:bg-slate-950 text-white py-12 border-t border-primary-light/20 dark:border-border">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl mb-4 group text-white">
                        <Building2 className="h-8 w-8 text-white group-hover:text-white/80 transition-colors" />
                        Le Rameau
                    </Link>
                    <p className="text-white/70 dark:text-muted-foreground max-w-sm mb-6 leading-relaxed">
                        La plateforme moderne et sécurisée pour la gestion de votre copropriété. Connectez-vous avec vos voisins et restez informés.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-4 text-white">Légal</h4>
                    <ul className="space-y-3">
                        <li><Link href="#" className="text-white/70 dark:text-muted-foreground hover:text-white transition-colors">Conditions Générales</Link></li>
                        <li><Link href="#" className="text-white/70 dark:text-muted-foreground hover:text-white transition-colors">Confidentialité</Link></li>
                        <li><Link href="#" className="text-white/70 dark:text-muted-foreground hover:text-white transition-colors">Mentions Légales</Link></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-semibold text-lg mb-4 text-white">Liens Utiles</h4>
                    <ul className="space-y-3">
                        <li><Link href="#features" className="text-white/70 dark:text-muted-foreground hover:text-white transition-colors">Fonctionnalités</Link></li>
                        <li><Link href="#" className="text-white/70 dark:text-muted-foreground hover:text-white transition-colors">À propos</Link></li>
                        <li><Link href="#" className="text-white/70 dark:text-muted-foreground hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 dark:border-border text-center text-white/50 dark:text-muted-foreground/50 text-sm">
                <p>&copy; {new Date().getFullYear()} Le Rameau. Tous droits réservés.</p>
            </div>
        </footer>
    );
}
