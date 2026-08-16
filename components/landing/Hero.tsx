"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { Bell, FileText, MessageSquareText, Vote } from "lucide-react";

export function Hero() {
    const [message, setMessage] = useState("Bienvenue sur le site de la copropriété");
    const [isAlert, setIsAlert] = useState(false);
    
    useEffect(() => {
        const supabase = createClient();
        async function fetchMessage() {
            try {
                const { data } = await supabase
                    .from('spline_message')
                    .select('*')
                    .eq('id', '00000000-0000-0000-0000-000000000001')
                    .single();
                    
                if (data && data.is_active && data.message && data.message.trim() !== '') {
                    setMessage(data.message);
                    setIsAlert(true);
                }
            } catch (err) {
                console.error("Error fetching residence message:", err);
            }
        }
        fetchMessage();
    }, []);

    const residentFeatures = [
        { label: "Actualités", icon: Bell, color: "bg-blue-100 text-blue-700" },
        { label: "Documents", icon: FileText, color: "bg-emerald-100 text-emerald-700" },
        { label: "Consultations", icon: Vote, color: "bg-amber-100 text-amber-700" },
    ];

    return (
        <section id="presentation" className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-light dark:from-slate-950 dark:to-slate-900 text-white py-24 lg:py-32 border-b border-border">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-5 mix-blend-overlay"></div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center lg:text-left"
                >
                    <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                        Bienvenue à la<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">Résidence Le Rameau</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-blue-100 dark:text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed text-justify lg:text-left">
                        Idéalement située au 5, rue André Malraux, au cœur du quartier Clemenceau à Dijon, la Résidence Le Rameau allie cadre de vie agréable et situation géographique privilégiée. À deux pas des commerces, des transports et de toutes les commodités du centre-ville, elle offre un environnement calme et résidentiel, pensé pour le confort de ses habitants au quotidien.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 w-full max-w-md lg:max-w-xl"
                >
                    <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-2xl shadow-black/25 sm:h-[430px] lg:h-[520px]">
                        <Image
                            src="/residence-bg.jpg"
                            alt="Façade et espaces verts de la Résidence Le Rameau"
                            fill
                            priority
                            sizes="(min-width: 1024px) 36rem, (min-width: 640px) 28rem, 100vw"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.6, type: "spring", bounce: 0.35 }}
                            className="absolute right-4 top-4 z-20 w-56 sm:right-6 sm:top-6"
                        >
                            <div className={`relative rounded-lg border p-4 text-sm font-semibold shadow-2xl shadow-black/20 backdrop-blur-md
                                ${isAlert
                                    ? 'border-red-300 bg-red-500/95 text-white'
                                    : 'border-white/60 bg-white/95 text-slate-900'}`}>
                                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-normal opacity-80">
                                    <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                                    Info résidence
                                </div>
                                {message}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.7 }}
                            className="absolute bottom-4 left-4 right-4 rounded-lg border border-white/20 bg-white/95 p-4 text-slate-950 shadow-xl backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-auto sm:w-80"
                        >
                            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">Espace résident</p>
                            <p className="mt-1 text-lg font-bold">Les informations de la copropriété au même endroit</p>
                            <div className="mt-4 grid gap-2">
                                {residentFeatures.map((feature) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div key={feature.label} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-3">
                                            <span className={`grid h-8 w-8 place-items-center rounded-md ${feature.color}`}>
                                                <Icon className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                            <span className="text-sm font-semibold">{feature.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
