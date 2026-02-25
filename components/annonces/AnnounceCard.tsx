"use client";

import { Annonce } from "../../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import Link from "next/link";
import { Paperclip } from "lucide-react";

interface AnnounceCardProps {
    annonce: Annonce;
}

export function AnnounceCard({ annonce }: AnnounceCardProps) {
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'travaux': return 'bg-warning text-white';
            case 'information': return 'bg-primary-light text-white';
            case 'assemblee': return 'bg-purple-500 text-white';
            default: return 'bg-muted text-white';
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow group cursor-pointer overflow-hidden border-border/50">
            <Link href={`/actualites/${annonce.id}`} className="block">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2 items-center">
                            <Badge className={getCategoryColor(annonce.categorie)} variant="secondary">
                                {annonce.categorie}
                            </Badge>
                            {annonce.is_important && (
                                <Badge variant="destructive" className="bg-danger text-[10px] animate-pulse">IMPORTANT</Badge>
                            )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {format(new Date(annonce.created_at), "d MMMM yyyy", { locale: fr })}
                        </span>
                    </div>
                    <CardTitle className="text-lg text-primary group-hover:text-primary-light transition-colors line-clamp-1">
                        {annonce.titre}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">Par {annonce.auteur?.prenom} {annonce.auteur?.nom} • {annonce.auteur?.role}</p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm/relaxed text-muted-foreground line-clamp-2">{annonce.contenu}</p>
                    {annonce.pieces_jointes && annonce.pieces_jointes.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-primary">
                            <Paperclip className="h-4 w-4" />
                            {annonce.pieces_jointes.length} pièce{annonce.pieces_jointes.length > 1 ? 's' : ''} jointe{annonce.pieces_jointes.length > 1 ? 's' : ''}
                        </div>
                    )}
                </CardContent>
            </Link>
        </Card>
    );
}
