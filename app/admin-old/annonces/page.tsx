"use client";

import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, AlertCircle } from "lucide-react";

export default function AdminAnnoncesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestion des Annonces</h1>
                    <p className="text-slate-500 font-medium">Modérez et gérez toutes les annonces de la résidence.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md h-12 px-6 rounded-xl font-bold w-full sm:w-auto">
                    <Plus className="mr-2 h-5 w-5" /> Publier
                </Button>
            </div>

            <Card className="border-dashed border-2 bg-slate-50/50 rounded-2xl mt-8">
                <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="bg-amber-100 text-amber-600 p-4 rounded-full mb-6 relative">
                        <AlertCircle className="h-8 w-8 absolute -top-1 -right-1" />
                        <NewspaperIcon className="h-12 w-12" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Module en construction</h2>
                    <p className="text-slate-500 max-w-md mx-auto font-medium">La gestion avancée des annonces sera disponible dans une prochaine mise à jour.</p>
                    <Button variant="outline" className="mt-8 font-bold border-slate-300">Retour au dashboard</Button>
                </CardContent>
            </Card>
        </div>
    );
}

function NewspaperIcon(props: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" /><path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" /></svg>;
}
