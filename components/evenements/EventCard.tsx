"use client";

import { Evenement } from "../../types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

export function EventCard({ event, compact = false }: { event: Evenement; compact?: boolean }) {
    const startDate = new Date(event.date_debut);
    const endDate = new Date(event.date_fin);

    if (compact) {
        return (
            <Card className="hover:shadow-md transition-shadow cursor-pointer overflow-hidden border-border/50 group bg-slate-50 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary group-hover:bg-primary-light transition-colors" />
                <CardContent className="p-4 flex flex-col gap-2">
                    <p className="font-bold text-primary group-hover:text-primary-light transition-colors line-clamp-1">{event.titre}</p>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="truncate">{event.lieu}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="flex flex-col sm:flex-row hover:shadow-md transition-shadow group overflow-hidden border-border/50">
            <div className="bg-primary/5 border-r border-border/50 p-4 sm:w-32 flex flex-col items-center justify-center gap-1 shrink-0">
                <span className="text-sm font-semibold uppercase text-muted-foreground tracking-widest">{format(startDate, "MMM", { locale: fr })}</span>
                <span className="text-4xl font-bold text-primary tabular-nums tracking-tighter">{format(startDate, "dd")}</span>
            </div>
            <div className="flex-1 flex flex-col p-5">
                <CardHeader className="p-0 mb-3 flex flex-row items-start justify-between">
                    <div>
                        <CardTitle className="text-xl text-primary font-bold group-hover:text-primary-light transition-colors">
                            {event.titre}
                        </CardTitle>
                        <p className="text-sm text-foreground/80 mt-1 line-clamp-2 leading-relaxed">{event.description}</p>
                    </div>
                </CardHeader>
                <CardContent className="p-0 mt-auto grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-border">
                        <Clock className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{format(startDate, "HH:mm")} à {format(endDate, "HH:mm")}</span>
                    </div>
                    <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-border">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">{event.lieu}</span>
                    </div>
                </CardContent>
                <div className="mt-auto flex justify-end">
                    <Button variant="outline" className="border-primary/20 hover:bg-primary hover:text-white transition-colors" size="sm">RSVP / S'inscrire</Button>
                </div>
            </div>
        </Card>
    );
}
