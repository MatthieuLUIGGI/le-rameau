import { Hero } from "../components/landing/Hero";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { Footer } from "../components/landing/Footer";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { AlertTriangle, Bell, MessageSquare, Building2 } from "lucide-react";
import Link from "next/link";
import { getInitials } from "../lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar Fixed */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Building2 className="h-6 w-6 text-primary" />
            Le Rameau
          </Link>
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-muted-foreground text-foreground/80">
            <Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link>
            <Link href="#about" className="hover:text-primary transition-colors">À propos</Link>
            <Link href="#contact" className="hover:text-primary transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="font-semibold text-primary hidden sm:flex" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button className="font-semibold bg-primary hover:bg-primary-light dark:bg-primary text-white dark:text-primary-foreground transition-colors" asChild>
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <Hero />

        <FeaturesSection />

        {/* CTA Final */}
        <section className="py-24 bg-primary dark:bg-slate-950 text-white text-center relative overflow-hidden border-t border-border" id="contact">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 mix-blend-overlay dark:opacity-5"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Prêt à moderniser votre copropriété ?</h2>
            <p className="text-xl text-blue-100 dark:text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">Rejoignez des centaines de résidences qui utilisent Le Rameau tous les jours.</p>
            <Button size="lg" className="bg-white dark:bg-primary text-primary dark:text-primary-foreground hover:bg-white/90 dark:hover:bg-primary/90 font-bold rounded-full px-8 h-14 text-lg shadow-xl" asChild>
              <Link href="/register">Créer mon espace gratuit</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
