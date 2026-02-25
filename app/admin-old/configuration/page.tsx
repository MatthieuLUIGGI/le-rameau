"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Save, Settings2, Building, ShieldAlert } from "lucide-react";

export default function AdminConfigPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configuration</h1>
                <p className="text-slate-500 font-medium">Paramètres généraux de la plateforme Le Rameau.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="shadow-sm border-border rounded-2xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-border">
                            <CardTitle className="flex items-center gap-2 text-slate-800"><Building className="text-indigo-500 h-5 w-5" /> Résidence</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Informations principales de la copropriété.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Nom de la copropriété</Label>
                                <Input defaultValue="Le Rameau" className="border-slate-300 h-11" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Adresse</Label>
                                    <Input defaultValue="15 rue des Tilleuls" className="border-slate-300 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold text-slate-700">Ville</Label>
                                    <Input defaultValue="Paris 15e" className="border-slate-300 h-11" />
                                </div>
                            </div>
                            <Button className="font-bold bg-slate-900 text-white hover:bg-slate-800 mt-4"><Save className="mr-2 h-4 w-4" /> Enregistrer</Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border rounded-2xl overflow-hidden border-t-4 border-t-emerald-500">
                        <CardHeader className="bg-slate-50 border-b border-border">
                            <CardTitle className="flex items-center gap-2 text-slate-800"><Settings2 className="text-emerald-500 h-5 w-5" /> Fonctionnalités</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">Activez ou désactivez les modules.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {/* Switches placeholders */}
                            <div className="space-y-4">
                                {[
                                    { name: "Module Météo", desc: "Affiche la météo sur le dashboard" },
                                    { name: "Canaux de messagerie", desc: "Autorise les résidents à créer des canaux" },
                                    { name: "Annuaire public", desc: "Affiche les numéros d'urgence" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                                        <div>
                                            <p className="font-bold text-slate-800">{feature.name}</p>
                                            <p className="text-sm text-slate-500 font-medium">{feature.desc}</p>
                                        </div>
                                        <div className="h-6 w-11 bg-emerald-500 rounded-full border-2 border-transparent relative transition-colors cursor-pointer">
                                            <div className="h-5 w-5 bg-white rounded-full absolute right-0 shadow-sm top-0 translate-x-[2px] -translate-y-[2px]"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card className="shadow-sm border-red-200 bg-red-50/30 rounded-2xl overflow-hidden">
                        <CardHeader className="border-b border-red-100">
                            <CardTitle className="flex items-center gap-2 text-red-700 line-clamp-1"><ShieldAlert className="h-5 w-5" /> Zone de danger</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-sm font-medium text-red-600/80 mb-4">Ces actions sont irréversibles et impactent tous les utilisateurs.</p>
                            <Button variant="destructive" className="w-full font-bold shadow-sm whitespace-normal h-auto py-3">Archiver la base de données</Button>
                            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold whitespace-normal h-auto py-3">Réinitialiser les mots de passe</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
