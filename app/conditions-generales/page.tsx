"use client";

import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function ConditionsGenerales() {
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
                    <h1 className="text-4xl font-extrabold text-primary mb-2">Conditions Générales d'Utilisation (CGU)</h1>
                    <p className="text-muted-foreground mb-8 font-medium">En date de : Mars 2026</p>

                    <div className="space-y-8 text-foreground/80 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Objet</h2>
                            <p>
                                Les présentes Conditions Générales d'Utilisation (ci-après désignées "CGU") définissent l'accès, les obligations ainsi que l'utilisation légale du portail "Le Rameau". Le portail vise la communication de proximité, la création de liens intergénérationnels et entre habitants, de même qu'un espace collaboratif (signalement, messagerie, documents et factures) à destination exclusive de la résidence située au 5 rue André Malraux, 21000 Dijon.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Conditions d'accès</h2>
                            <p>
                                L'accès complet aux fonctionnalités est conditionné et réservé avec fermeté aux seules personnes justifiant d'un ancrage dans la copropriété : <strong>copropriétaires, administrateurs de biens (syndic et agences impliquées), membres du conseil syndical (CS), et résidents / locataires de tout ou partie des lots.</strong>
                            </p>
                            <p className="mt-4">
                                L'inscription est soumise à un contrôle obligatoire des gestionnaires afin d'éviter tout détournement d'usage et les attaques sociales. Lors de la demande d'authentification, le membre de la plateforme reconnaît utiliser l'authentification à son strict usage, par conséquent chaque mot de passe créé assure un haut niveau de confidentialité. L'accès aux divers modules est octroyé en considération de l'attribut (Rôle utilisateur) sur avis d'acceptation du comité de gestion de la résidence.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Comportements attendus et responsabilités</h2>
                            <p>
                                Le Syndicat des Copropriétaires ainsi que notre équipe modératrice requièrent de ses utilisateurs un plein respect civique et interpersonnel :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground">
                                <li><strong className="font-bold">Interdictions strictes :</strong> La publication de messages haineux, à nature diffamatoire, injurieux ou contraires à la loi pour la Confiance dans l'Economie Numérique (LCEN) dans les messages et canaux de diffusions sont fermement proscrites.</li>
                                <li><strong className="font-bold">Responsabilité :</strong> Aucun message n'est avalisé ni contrôlé a priori par la gestion de copropriété. Dès l'émission, tout écrit de chaque participant l'engage moralement et au niveau judiciaire quant à ses éventuelles responsabilités. L'utilisateur concède 100% l'autorité d'éditions et la validation qu'il exécute.</li>
                                <li><strong className="font-bold">Modération :</strong> Des signalements envers la copropriété peuvent entraîner sur examen la modification ou la suppression immédiate des informations par le Syndic (modération a posteriori). La récidive permet la clôture, l'exclusion définitive du portail "Le Rameau", et de potentielles suites juridiques.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Maintenance du service et Force Majeure</h2>
                            <p>
                                L'éditeur emploie l'état de l'art actuel (2026) pour rendre pérenne et sécurisé l'ensemble du trafic, garantir 99.9% de disponibilité du support et hébergement numérique.
                                Néanmoins, par les contraintes matérielles ou cas de désastres ou pannes extérieurs ("Force Majeure"), les défaillances et fermetures soudaines pour corriger un risque de sécurité vital de réseau n'ouvre aucunement l'exigence d'une quelconque réparation à charge.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Opposabilité et Validité</h2>
                            <p>
                                L'utilisation courante des services interactifs emporte l'acceptation formelle, sans réserve, par l'intéressé (membre validé). En cas de désaccord persistant entre le membre et nos conditions de service, les requérants peuvent résilier le compte unilatéralement, supprimant en ce terme la jouissance aux fonctions offertes.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
