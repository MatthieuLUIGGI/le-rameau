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
            <Link href="#presentation" className="hover:text-primary transition-colors">Présentation</Link>
            <Link href="#features" className="hover:text-primary transition-colors">Fonctionnalités</Link>
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
      </main>

      <Footer />
    </div>
  );
}
