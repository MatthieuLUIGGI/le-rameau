"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "../../../components/ui/input";

export default function AdminUtilisateursPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Utilisateurs</h1>
                    <p className="text-slate-500 font-medium">Gérez les comptes résidents de votre copropriété.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-md h-12 px-6 rounded-xl font-bold w-full sm:w-auto">
                    <Plus className="mr-2 h-5 w-5" /> Inviter
                </Button>
            </div>

            <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
                <div className="p-4 border-b border-border bg-slate-50 flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                        <Input className="pl-10 border-slate-200 bg-white h-11 rounded-lg" placeholder="Chercher un nom, appartement..." />
                    </div>
                    <Button variant="outline" className="h-11 border-slate-200 bg-white font-medium px-4 gap-2">
                        <Filter className="h-4 w-4" /> Filtres
                    </Button>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-4">Nom complet</th>
                                    <th className="px-6 py-4">Rôle</th>
                                    <th className="px-6 py-4">Appartement</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {/* Simulation de lignes */}
                                {[1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-slate-700">Utilisateur {i}</td>
                                        <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Résident</span></td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">A{i}2</td>
                                        <td className="px-6 py-4"><span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase">Vérifié</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors">Modifier</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
