"use client";

import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function Confidentialite() {
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
                    <h1 className="text-4xl font-extrabold text-primary mb-2">Politique de Confidentialité</h1>
                    <p className="text-muted-foreground mb-8 font-medium">Mise à jour : Mars 2026. Conforme aux exigences du RGPD 2026 et à la Loi Informatique et Libertés.</p>

                    <div className="space-y-8 text-foreground/80 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Collecte et Responsable de Traitement</h2>
                            <p>
                                Le Syndicat des Copropriétaires de la résidence "Le Rameau" s'engage à traiter vos données dans le respect scrupuleux de la protection des données (RGPD).
                                Lors de votre utilisation de la plateforme, les données suivantes sont susceptibles d'être collectées :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground">
                                <li><strong className="font-bold">Données d'identité :</strong> nom, prénom.</li>
                                <li><strong className="font-bold">Coordonnées :</strong> adresse électronique (email), bâtiment, numéro du lot (appartement).</li>
                                <li><strong className="font-bold">Données liées à votre usage de la plateforme :</strong> messages échangés, historique de connexion et de signaux.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Finalités du traitement des données</h2>
                            <p>Vos données sont strictement recueillies et traitées pour les finalités suivantes :</p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground">
                                <li><strong className="font-bold">Gestion des comptes et des accès :</strong> Vérifier l'identité des résidents et co-propriétaires de l'immeuble pour un accès sécurisé.</li>
                                <li><strong className="font-bold">Communication :</strong> Interagir entre résidents, membres du Conseil Syndical, et le Syndic.</li>
                                <li><strong className="font-bold">Administration courante :</strong> Gestion des interventions (pannes, réparations), des assemblées générales, des alertes de sécurité et consultation des documents (ag, factures, compte-rendu).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Bases légales et transferts hors UE</h2>
                            <p>
                                Conformément à l'Article 6 du RGPD 2026, la base légale s'appuie sur le <strong>Consentement Exprès</strong> (Art 6.1.a) à l'inscription et la <strong>Nécessité de service</strong> pour le bon déroulement de l'information dans la copropriété (Art 6.1.f).
                            </p>
                            <p className="mt-4">
                                <strong>Aucune donnée n'est transférée en dehors de l'Union Européenne.</strong> Nos partenaires techniques (hébergeur, fournisseur de la base de données) sont configurés pour stocker vos informations de manière chiffrée en zone UE.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Durée de conservation</h2>
                            <p>
                                Vos données sont conservées de manière sécurisée pendant toute la durée de votre occupation de la résidence en tant que résident, locataire ou co-propriétaire. En cas de départ, vos informations personnelles et identifiables (incluant votre compte et ses messages) seront effacées automatiquement après <strong>un traitement de droit à l'oubli de 30 jours</strong>. Seules les données comptables strictes liées à la quote-part seront conservées conformément aux lois fiscales et civiles à destination unique du syndic (environ 10 ans).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Vos droits (Droit d'accès, d'oubli, portabilité)</h2>
                            <p>
                                En vertu de la législation de protection à la vie privée 2026, vous bénéficiez de droits étendus qui peuvent à tout moment être invoqués à l'intérieur de l'application (section <strong>Mon Profil</strong>) :
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4 text-foreground">
                                <li><strong className="font-bold">Droit d'accès et d'effacement ("Droit à l'oubli") :</strong> vous pouvez, par un simple bouton dans votre espace membre ou par demande, effacer la totalité de votre historique utilisateur.</li>
                                <li><strong className="font-bold">Droit à la portabilité :</strong> vous pouvez télécharger au format interopérable (CSV, JSON) les informations communiquées sur la plateforme.</li>
                                <li><strong className="font-bold">Droit de rectification :</strong> vous êtes en capacité de modifier seul à loisir vos identités, informations de contact, via le tableau de bord.</li>
                            </ul>
                            <p className="mt-4">
                                En cas de divergence quant au traitement et pour introduire une réclamation, vous avez le droit de saisir toute autorité de protection nationale, comme la Commission Nationale de l'Informatique et des Libertés (CNIL).
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
