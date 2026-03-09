"use client";

import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function MentionsLegales() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Building2 className="h-6 w-6 text-primary" />
                        Le Rameau
                    </Link>
                    <Button variant="ghost" asChild>
                        <Link href="/" className="flex items-center gap-2 text-primary font-semibold">
                            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
                        </Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-3xl prose prose-slate dark:prose-invert">
                    <h1 className="text-4xl font-extrabold text-primary mb-2">Mentions Légales</h1>
                    <p className="text-muted-foreground mb-8 font-medium">Mise à jour : Mars 2026</p>

                    <div className="space-y-8 text-foreground/80 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Éditeur de la plateforme</h2>
                            <p>
                                La plateforme coopérative "Le Rameau" est éditée par le Syndicat des Copropriétaires de la Résidence Le Rameau :
                                <br /><br />
                                <strong>Résidence Le Rameau</strong><br />
                                5 rue André Malraux<br />
                                21000 Dijon, France
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Directeur de la publication</h2>
                            <p>
                                Le directeur de la publication est le Président du Conseil Syndical en exercice de la résidence Le Rameau, agissant au nom et pour le compte du syndicat des copropriétaires.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Hébergement</h2>
                            <p>
                                La plateforme est hébergée par Vercel Inc. :<br />
                                340 S Lemon Ave #4133<br />
                                Walnut, CA 91789, États-Unis<br />
                                Site web : https://vercel.com
                            </p>
                            <p className="mt-4">
                                Les bases de données (incluant les données utilisateurs) sont strictement hébergées par Supabase sur des serveurs situés en Union Européenne (Région Europe, AWS), afin de garantir une totale conformité avec le Règlement Général sur la Protection des Données (RGPD).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Propriété intellectuelle</h2>
                            <p>
                                La structure générale de la plateforme (design, arborescence), ainsi que les textes, graphiques, images, sons et vidéos la composant, sont la propriété de la Résidence Le Rameau ou de ses partenaires.
                                <br /><br />
                                Toute représentation, reproduction, exploitation partielle ou totale de ces contenus, par quelque procédé que ce soit, est strictement interdite sans l'autorisation écrite préalable de l'éditeur du site.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Loi applicable et juridiction compétente</h2>
                            <p>
                                Les présentes mentions légales, ainsi que la plateforme, sont soumises intégralement au droit français. En cas de litige n'ayant pu trouver d'issue amiable, seuls les tribunaux français (ressort de la Cour d'Appel de Dijon) seront jugés compétents.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
