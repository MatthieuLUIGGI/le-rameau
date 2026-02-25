"use client";

import { useUser } from "../../lib/hooks/useUser";
import { useMessages } from "../../lib/hooks/useMessages";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AlertTriangle, Mail, Newspaper } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export function QuickActions() {
    const { user } = useUser();
    const { messages } = useMessages();

    const unreadMessagesCount = messages?.filter(m => !m.is_read).length || 0;

    return (
        <Card className="h-full shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {(user?.role === 'admin' || user?.role === 'conseil' || user?.role === 'super_admin') && (
                    <Button variant="destructive" asChild className="w-full justify-start h-12 shadow-sm font-medium">
                        <Link href="/alertes?create=true">
                            <AlertTriangle className="mr-2 h-5 w-5" />
                            Déclencher une alerte
                        </Link>
                    </Button>
                )}

                <Button variant="default" asChild className="w-full justify-start h-12 shadow-sm font-medium bg-primary hover:bg-primary-light">
                    <Link href="/messages" className="relative">
                        <Mail className="mr-2 h-5 w-5" />
                        Nouveau message
                        {unreadMessagesCount > 0 && (
                            <Badge className="ml-auto bg-white text-primary hover:bg-white">{unreadMessagesCount}</Badge>
                        )}
                    </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start h-12 shadow-sm font-medium border-success/30 text-success hover:bg-success hover:text-white">
                    <Link href="/annonces">
                        <Newspaper className="mr-2 h-5 w-5" />
                        Voir les annonces
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
