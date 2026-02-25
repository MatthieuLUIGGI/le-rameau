import { Hero } from "../components/landing/Hero";
import { FeaturesSection } from "../components/landing/FeaturesSection";
import { Footer } from "../components/landing/Footer";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { AlertTriangle, Bell, MessageSquare, Building2 } from "lucide-react";
import Link from "next/link";

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

        {/* Bande Stats */}
        <section className="bg-primary-light/10 border-y border-primary-light/20 py-12">
          <div className="container mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-light/20">
            <div className="flex flex-col items-center justify-center pt-8 sm:pt-0">
              <span className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">2 400+</span>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">résidents</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 sm:pt-0">
              <span className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">98%</span>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">satisfaction</span>
            </div>
            <div className="flex flex-col items-center justify-center pt-8 sm:pt-0">
              <span className="text-4xl md:text-5xl font-black text-primary tracking-tight mb-2">&lt; 2 min</span>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-primary/80">réponse urgences</span>
            </div>
          </div>
        </section>

        <FeaturesSection />

        {/* Section Alertes */}
        <section className="py-24 bg-surface border-y border-border">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Réagissez rapidement en cas d'urgence</h2>
            <p className="text-lg text-muted-foreground mb-12">
              Un tableau électrique qui fume ? Une fuite dans le parking ? Prévenez tout l'immeuble et le syndic en 3 clics.
            </p>

            <Card className="max-w-md mx-auto bg-danger/5 border-danger/20 text-left shadow-lg overflow-hidden shrink-0 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-danger animate-pulse"></div>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-background p-3 rounded-full shadow-sm shrink-0">
                    <AlertTriangle className="h-8 w-8 text-danger animate-pulse" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 mb-2">
                      <span className="bg-danger text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">URGENT</span>
                    </div>
                    <h3 className="text-xl font-bold text-danger mb-2">Fuite d'eau majeure au niveau -2</h3>
                    <p className="text-sm text-foreground/80 font-medium">L'eau monte rapidement près des box 40 à 50. Merci de déplacer vos véhicules si possible.</p>
                    <p className="text-xs text-muted-foreground mt-4 font-semibold">Il y a 2 minutes par Jean D. (Gardien)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section Témoignages */}
        <section className="py-24 bg-background" id="about">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary mb-16">Ils ont adopté Le Rameau</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { name: "Marie L.", role: "Résidente depuis 2 ans", text: "Je ne rate plus aucune annonce pour l'entretien de la chaudière. Et la messagerie entre voisins est super pratique !" },
                { name: "Paul B.", role: "Membre du conseil syndical", text: "Centraliser les alertes et les documents nous a fait gagner un temps fou. Tout est transparent et accessible." },
                { name: "Sophie M.", role: "Gardienne de l'immeuble", text: "L'annuaire des urgences m'aide au quotidien. Dès qu'il y a un souci, je sais qui appeler en priorité sans chercher." }
              ].map((t, i) => (
                <Card key={i} className="bg-surface shadow-sm hover:shadow-md transition-shadow h-full flex flex-col p-6 rounded-2xl border-none border border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-12 w-12 bg-primary/10 text-primary border border-primary/20 font-bold">
                      <AvatarFallback>{t.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-primary">{t.name}</h4>
                      <p className="text-xs text-muted-foreground font-medium">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 pl-4 border-primary/20 shrink-0 mt-auto">« {t.text} »</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

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
