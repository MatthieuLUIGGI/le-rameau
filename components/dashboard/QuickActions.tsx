"use client";

import { useUser } from "../../lib/hooks/useUser";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { AlertTriangle, Newspaper } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    const { user } = useUser();

    return (
        <Card className="h-full shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button variant="default" asChild className="w-full justify-start h-12 shadow-sm font-medium bg-primary hover:bg-primary-light">
                    <Link href="/actualites">
                        <Newspaper className="mr-2 h-5 w-5" />
                        Voir les actualités
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
