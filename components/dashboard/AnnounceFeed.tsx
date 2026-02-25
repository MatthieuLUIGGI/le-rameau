"use client";

import { useAnnonces } from "../../lib/hooks/useAnnonces";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import { Paperclip, ArrowRight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function AnnounceFeed() {
    const { annonces, isLoading } = useAnnonces();

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'travaux': return 'bg-warning text-white hover:bg-warning/80';
            case 'information': return 'bg-[#2E75B6] text-white hover:bg-[#2E75B6]/80';
            case 'assemblee': return 'bg-purple-500 text-white hover:bg-purple-500/80';
            default: return 'bg-slate-500 text-white hover:bg-slate-500/80';
        }
    };

    return (
        <Card className="flex flex-col h-full shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl font-bold">Dernières annonces</CardTitle>
                <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary-light">
                    <Link href="/actualites">
                        Voir tout <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-1/3" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                    ))
                ) : annonces?.slice(0, 3).map((annonce) => (
                    <Link key={annonce.id} href={`/actualites/${annonce.id}`} className="group block p-3 -mx-3 rounded-xl hover:bg-muted/5 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className={getCategoryColor(annonce.categorie)} variant="secondary">
                                {annonce.categorie}
                            </Badge>
                            {annonce.is_important && (
                                <Badge variant="destructive" className="bg-danger text-[10px]">IMPORTANT</Badge>
                            )}
                            <span className="text-xs text-muted-foreground ml-auto">
                                {format(new Date(annonce.created_at), "d MMM", { locale: fr })}
                            </span>
                        </div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{annonce.titre}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{annonce.contenu}</p>
                        {annonce.pieces_jointes && annonce.pieces_jointes.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Paperclip className="h-3 w-3" /> 1 pièce jointe
                            </div>
                        )}
                    </Link>
                ))}
                {annonces?.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground flex-1 flex flex-col items-center justify-center">
                        <p>Aucune annonce pour le moment.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
