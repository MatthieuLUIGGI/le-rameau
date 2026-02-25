"use client";

import { Card, CardContent } from "../../../components/ui/card";
import { Mail, MapPin, Send } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Button } from "../../../components/ui/button";

export default function ContactezNousPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 pt-6 px-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-primary mb-2">Contactez-nous</h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Prenez contact ou retrouvez toutes les informations de la résidence.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                    <Card className="bg-surface border-border shadow-md hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Mail className="w-24 h-24 -mt-4 -mr-4 text-primary" />
                        </div>
                        <CardContent className="p-6 flex items-start gap-5 relative z-10">
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <Mail className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-extrabold text-foreground">Par Email</h3>
                                <p className="text-muted-foreground font-medium text-sm">
                                    Envoyez-nous un email pour toute demande, signalement de badge perdu ou question concernant la résidence.
                                </p>
                                <a
                                    href="mailto:residence.lerameau@laposte.net"
                                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 font-bold transition-colors"
                                >
                                    residence.lerameau@laposte.net
                                </a>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface border-border shadow-md hover:shadow-lg transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                            <MapPin className="w-24 h-24 -mt-4 -mr-4 text-primary" />
                        </div>
                        <CardContent className="p-6 flex items-start gap-5 relative z-10">
                            <div className="p-4 rounded-2xl bg-primary/10 text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <MapPin className="h-8 w-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-extrabold text-foreground">Notre Adresse</h3>
                                <p className="text-muted-foreground font-medium text-sm">
                                    Adresse physique de la résidence "Le Rameau" pour vos courriers ou livraisons.
                                </p>
                                <div className="mt-2 bg-muted p-4 rounded-xl border border-border/50">
                                    <address className="not-italic text-lg font-bold text-foreground">
                                        5 Rue André Malraux<br />
                                        <span className="text-primary font-black">21000 Dijon</span>
                                    </address>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="relative w-full h-[400px] lg:h-full min-h-[400px]">
                    <Card className="bg-surface rounded-3xl border border-border mt-0 shadow-sm relative overflow-hidden h-full group pb-1">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-primary to-blue-500 z-10"></div>
                        <div className="absolute top-6 left-6 z-10 bg-background/90 backdrop-blur-md px-4 py-3 rounded-xl border border-border/50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <p className="font-bold text-sm text-foreground flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary" /> Résidence Le Rameau
                            </p>
                        </div>
                        <iframe
                            src="https://maps.google.com/maps?q=5%20Rue%20Andr%C3%A9%20Malraux,%2021000%20Dijon&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full grayscale-[30%] opacity-90 hover:grayscale-0 hover:opacity-100 transition-all duration-700 mt-2"
                        ></iframe>
                    </Card>
                </div>
            </div>
        </div>
    );
}
