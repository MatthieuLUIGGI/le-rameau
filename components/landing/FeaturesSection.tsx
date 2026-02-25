"use client";

import { Bell, AlertTriangle, MessageSquare, Calendar, Phone, Cloud, Newspaper, Shield, Key, Users, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { motion } from "framer-motion";

const features = [
    {
        title: "Actualités",
        description: "Restez informé des dernières nouvelles de la copropriété.",
        icon: Newspaper,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Conseil Syndical",
        description: "Membres du conseil syndical et le syndic.",
        icon: Shield,
        color: "text-purple-500",
        bg: "bg-purple-500/10"
    },
    {
        title: "Badges Vigik",
        description: "Gérez vos accès électroniques à la résidence.",
        icon: Key,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        title: "Assemblées Générales",
        description: "Accédez aux comptes rendus des assemblées générales.",
        icon: Users,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10"
    },
    {
        title: "Consultations",
        description: "Participez aux consultations et exprimez votre opinion.",
        icon: MessageSquare,
        color: "text-green-500",
        bg: "bg-green-500/10"
    },
    {
        title: "Contactez-nous",
        description: "Contactez-nous directement.",
        icon: Mail,
        color: "text-rose-500",
        bg: "bg-rose-500/10"
    }
];

export function FeaturesSection() {
    return (
        <section className="py-24 bg-background" id="features">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Tout ce dont votre immeuble a besoin</h2>
                    <p className="text-lg text-muted-foreground">
                        Une suite complète d'outils conçue spécifiquement pour simplifier la vie en copropriété.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow bg-surface">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.bg}`}>
                                        <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
