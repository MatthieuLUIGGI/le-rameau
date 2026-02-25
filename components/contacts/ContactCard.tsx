"use client";

import { Contact } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Phone, Mail, Clock, Info } from "lucide-react";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";

export function ContactCard({ contact }: { contact: Contact }) {
    const isEmergency = contact.nom.toLowerCase().includes('pompier') ||
        contact.nom.toLowerCase().includes('police') ||
        contact.nom.toLowerCase().includes('samu') ||
        contact.nom.toLowerCase().includes('urgence');

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md border-border/50 ${isEmergency ? 'bg-danger/5 border-danger/30' : 'bg-surface'}`}>
            <CardContent className="p-5 flex flex-col h-full relative">
                {isEmergency && <div className="absolute top-0 right-0 left-0 h-1 bg-danger"></div>}

                <div className="flex items-start gap-4 mb-4">
                    <Avatar className={`h-12 w-12 ${isEmergency ? 'bg-danger text-white' : 'bg-primary text-white'} border border-black/10 shadow-sm`}>
                        <AvatarFallback className="text-lg font-bold bg-transparent">
                            {contact.nom.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 pt-1">
                        <h3 className={`font-bold text-lg mb-1 leading-tight ${isEmergency ? 'text-danger' : 'text-primary'}`}>{contact.nom}</h3>
                        <Badge variant="outline" className={`font-semibold bg-white shadow-sm ${isEmergency ? 'border-danger/30 text-danger' : 'border-border text-muted-foreground'} text-[10px]`}>
                            {contact.role}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-end mt-2">
                    {contact.telephone && (
                        <a href={`tel:${contact.telephone}`} className={`flex items-center gap-3 text-sm p-2 rounded-lg transition-colors border ${isEmergency ? 'bg-danger/10 text-danger border-danger/20 hover:bg-danger/20 hover:border-danger/40' : 'bg-slate-50 text-foreground border-border hover:bg-black/5 hover:border-border/80'}`}>
                            <Phone className="h-4 w-4 shrink-0" />
                            <span className="font-semibold tracking-wide">{contact.telephone}</span>
                        </a>
                    )}

                    {contact.email && (
                        <a href={`mailto:${contact.email}`} className="flex items-center gap-3 text-sm p-2 rounded-lg bg-slate-50 hover:bg-black/5 text-foreground transition-colors border border-border hover:border-border/80">
                            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate font-medium">{contact.email}</span>
                        </a>
                    )}

                    {contact.disponibilite && (
                        <div className="flex items-center gap-3 text-xs p-2 text-muted-foreground mt-auto pt-2 border-t border-border">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{contact.disponibilite}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
