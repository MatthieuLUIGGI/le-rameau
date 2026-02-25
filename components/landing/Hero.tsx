"use client";

import { motion } from "framer-motion";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Script from "next/script";
import { useEffect } from "react";

export function Hero() {
    useEffect(() => {
        const hideLogo = () => {
            const splines = document.querySelectorAll('spline-viewer');
            splines.forEach((spline) => {
                if (spline.shadowRoot) {
                    const logo = spline.shadowRoot.querySelector('#logo');
                    if (logo) logo.remove();
                }
            });
        };
        const intervalId = setInterval(hideLogo, 1000);
        setTimeout(() => clearInterval(intervalId), 10000); // Stop checking after 10s
        return () => clearInterval(intervalId);
    }, []);

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-light dark:from-slate-950 dark:to-slate-900 text-white py-24 lg:py-32 border-b border-border">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-5 mix-blend-overlay"></div>

            <div className="container mx-auto px-4 relative z-10 flex flex-col lg:flex-row items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 text-center lg:text-left"
                >
                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        Ton immeuble,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">dans la poche.</span>
                    </h1>
                    <p className="text-lg lg:text-xl text-blue-100 dark:text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                        La plateforme tout-en-un pour les résidents et les gestionnaires de copropriété.
                        Annonces, alertes, messagerie et bien plus.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Button size="lg" className="bg-white dark:bg-primary text-primary dark:text-primary-foreground hover:bg-white/90 dark:hover:bg-primary/90 font-bold rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-xl border border-white/10" asChild>
                            <Link href="/register">Commencer gratuitement</Link>
                        </Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 w-full max-w-md lg:max-w-xl"
                >
                    <div className="relative w-full h-[400px] lg:h-[600px] flex items-center justify-center">
                        <Script type="module" src="https://unpkg.com/@splinetool/viewer@1.12.60/build/spline-viewer.js" strategy="lazyOnload" />
                        <style dangerouslySetInnerHTML={{
                            __html: `
                            spline-viewer::part(logo) {
                                display: none !important;
                            }
                        `}} />
                        <div className="w-full h-full" dangerouslySetInnerHTML={{
                            __html: `<spline-viewer url="https://prod.spline.design/SHNAia1yu84cUs1T/scene.splinecode" style="width: 100%; height: 100%;"></spline-viewer>`
                        }} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
