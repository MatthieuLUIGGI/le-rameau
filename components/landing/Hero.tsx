"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Spline from '@splinetool/react-spline';
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export function Hero() {
    const [message, setMessage] = useState("Bienvenue sur le site de la Copropriété");
    const [isAlert, setIsAlert] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
        const supabase = createClient();
        async function fetchMessage() {
            try {
                const { data, error } = await supabase
                    .from('spline_message')
                    .select('*')
                    .eq('id', '00000000-0000-0000-0000-000000000001')
                    .single();
                    
                if (data && data.is_active && data.message && data.message.trim() !== '') {
                    setMessage(data.message);
                    setIsAlert(true);
                }
            } catch (err) {
                console.error("Error fetching spline message:", err);
            }
        }
        fetchMessage();
        setMounted(true);
    }, []);

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
                    <div className="relative w-full h-[400px] lg:h-[600px] flex items-center justify-center">
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: 1.5, duration: 0.6, type: "spring", bounce: 0.5 }}
                            className="absolute top-4 right-4 lg:top-10 lg:right-10 z-20 w-48 lg:w-56"
                        >
                            <div className={`relative p-4 rounded-2xl shadow-2xl text-sm lg:text-base font-bold text-center border shadow-black/20 backdrop-blur-md
                                ${isAlert 
                                    ? 'bg-red-500/95 text-white border-red-400' 
                                    : 'bg-white/95 text-slate-900 border-white/50'}`}>
                                {message}
                                
                                {/* Bubble tail pointing bottom-left */}
                                <div className="absolute -bottom-3 left-1/4 w-0 h-0 
                                    border-l-[12px] border-l-transparent 
                                    border-t-[16px] border-r-[12px] border-r-transparent transform -rotate-12"
                                    style={{ borderTopColor: isAlert ? '#ef4444' : 'rgba(255, 255, 255, 0.95)' }}>
                                </div>
                            </div>
                        </motion.div>
                        <div className="w-full h-full relative flex items-center justify-center pointer-events-auto">
                            {mounted && (
                                <Spline 
                                    scene="https://prod.spline.design/SHNAia1yu84cUs1T/scene.splinecode" 
                                    style={{ width: '100%', height: '100%' }}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
