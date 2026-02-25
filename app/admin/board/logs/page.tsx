"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Loader2, Search, Calendar, Filter, Activity, Eye, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../../components/ui/dialog";
import { Input } from "../../../../components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type LogEntry = {
    id: string;
    user_id: string | null;
    user_name: string;
    user_email: string;
    action_type: string;
    details: string | null;
    old_data: any;
    new_data: any;
    created_at: string;
};

export default function BoardLogsPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterAction, setFilterAction] = useState<string>("Toutes");
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

    const fetchLogs = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('user_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setLogs(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.user_name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (log.user_email?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (log.details?.toLowerCase() || '').includes(search.toLowerCase());

        const matchesAction = filterAction === "Toutes" || log.action_type === filterAction;

        return matchesSearch && matchesAction;
    });

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const actionTypes = ["Toutes", "Connexion", "Déconnexion", "Création", "Modification", "Suppression"];

    const getActionColor = (action: string) => {
        switch (action) {
            case 'Connexion': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Déconnexion': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Création': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Modification': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'Suppression': return 'bg-danger/10 text-danger border-danger/20';
            default: return 'bg-muted/30 text-muted-foreground border-border';
        }
    };

    const getDifferences = (oldData: any, newData: any) => {
        const diffs: { key: string, oldVal: any, newVal: any }[] = [];

        const oldObj = (oldData && typeof oldData === 'object') ? oldData : {};
        const newObj = (newData && typeof newData === 'object') ? newData : {};

        const keysToCheck = Array.from(new Set([...Object.keys(oldObj), ...Object.keys(newObj)]));
        const IGNORED_KEYS = ['id', 'created_at', 'updated_at'];

        keysToCheck.forEach(key => {
            if (IGNORED_KEYS.includes(key)) return;

            const oldVal = oldObj[key];
            const newVal = newObj[key];

            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                diffs.push({
                    key,
                    oldVal: oldVal !== undefined ? oldVal : 'Non défini',
                    newVal: newVal !== undefined ? newVal : 'Non défini'
                });
            }
        });

        return diffs;
    };

    const formatDiffValue = (val: any) => {
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) {
            const formattedItems = val.map(item => {
                if (typeof item === 'object' && item !== null) {
                    if (item.texte) return `"${item.texte}"`;
                    if (item.nom) return `"${item.nom}"`;
                    if (item.titre) return `"${item.titre}"`;
                    return JSON.stringify(item);
                }
                return String(item);
            });
            return `[ ${formattedItems.join(' ,  ')} ]`;
        }
        if (val === null || val === undefined) return 'Non défini';
        return JSON.stringify(val);
    };

    const getPageName = (details: string | null) => {
        if (!details) return "Général";
        const d = details.toLowerCase();
        if (d.includes("syndic")) return "Syndic";
        if (d.includes("cs") || d.includes("conseil syndical")) return "Conseil Syndical";
        if (d.includes("ag") || d.includes("assemblée") || d.includes("assemblé")) return "Assemblée Générale";
        if (d.includes("actualité") || d.includes("annonce")) return "Actualités";
        if (d.includes("sondage") || d.includes("consultation")) return "Consultations";
        if (d.includes("vigik") || d.includes("badge")) return "Badges Vigik";
        if (d.includes("connexion") || d.includes("déconnexion")) return "Authentification";
        return "Général";
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary mb-2 flex items-center gap-3">
                        <Activity className="h-8 w-8 text-primary" />
                        Logs d'activité
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Historique des actions effectuées par les utilisateurs.
                    </p>
                </div>
            </div>

            <Card className="bg-surface border-border shadow-sm p-4 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, email ou détails..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-11 bg-background"
                    />
                </div>
                <div className="flex items-center gap-2 bg-background border border-input rounded-md px-3 h-11 min-w-[200px]">
                    <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                        className="bg-transparent text-foreground border-none text-sm font-medium w-full focus:outline-none focus:ring-0 cursor-pointer"
                    >
                        {actionTypes.map(type => (
                            <option key={type} value={type} className="bg-background text-foreground">{type}</option>
                        ))}
                    </select>
                </div>
            </Card>

            <Card className="bg-surface border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-bold">Horodatage</th>
                                <th className="px-6 py-4 font-bold">Action</th>
                                <th className="px-6 py-4 font-bold">Utilisateur</th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold text-right">Page concernée</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id} onClick={() => setSelectedLog(log)} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-2 text-foreground font-medium whitespace-nowrap">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        {format(new Date(log.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getActionColor(log.action_type)}`}>
                                            {log.action_type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-foreground">
                                        {log.user_name}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {log.user_email}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end pr-4 text-sm font-semibold text-muted-foreground">
                                            {getPageName(log.details)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        Aucun log trouvé correspondant aux critères.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedLog && (
                        <>
                            <DialogHeader className="mb-4">
                                <DialogTitle className="flex items-center gap-2 text-2xl">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border ${getActionColor(selectedLog.action_type)}`}>
                                        {selectedLog.action_type.toUpperCase()}
                                    </span>
                                    Détails du log
                                </DialogTitle>
                                <DialogDescription className="text-muted-foreground flex items-center gap-1.5 pt-2 font-medium">
                                    <Calendar className="w-4 h-4" /> {format(new Date(selectedLog.created_at), 'dd MMMM yyyy à HH:mm:ss', { locale: fr })}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6">
                                <section className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border/50 pb-2">Informations Utilisateur</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold mb-1">Nom Complet</p>
                                            <p className="font-semibold text-foreground text-lg">{selectedLog.user_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-semibold mb-1">Email</p>
                                            <p className="font-semibold text-foreground text-lg">{selectedLog.user_email}</p>
                                        </div>
                                        {selectedLog.user_id && (
                                            <div className="col-span-2">
                                                <p className="text-xs text-muted-foreground font-semibold mb-1">ID Utilisateur (UUID)</p>
                                                <p className="text-xs font-mono text-muted-foreground bg-background border px-2 py-1 rounded-md w-fit">{selectedLog.user_id}</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/50">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b border-border/50 pb-2">Détails textuels</h3>
                                    <p className="text-foreground font-medium">{selectedLog.details || "Aucun détail particulier"}</p>
                                </section>

                                {(selectedLog.old_data || selectedLog.new_data) && (
                                    <section className="space-y-4 pt-2">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Comparatif (Avant/Après)</h3>

                                        {getDifferences(selectedLog.old_data, selectedLog.new_data).length > 0 && (
                                            <div className="bg-muted/10 border border-border/70 rounded-xl p-4 space-y-3">
                                                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-primary" /> Modifications détectées
                                                </h4>
                                                <ul className="space-y-2">
                                                    {getDifferences(selectedLog.old_data, selectedLog.new_data).map((diff, idx) => (
                                                        <li key={idx} className="text-sm flex flex-col md:flex-row md:items-center gap-2">
                                                            <span className="font-semibold px-2 py-0.5 bg-background border rounded-md">{diff.key}</span>
                                                            <span className="text-muted-foreground flex items-center gap-2 flex-wrap text-xs md:text-sm">
                                                                <span className="line-through text-danger/80 break-all">{formatDiffValue(diff.oldVal)}</span>
                                                                <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                                                                <span className="text-success font-medium bg-success/10 px-1 rounded break-all">{formatDiffValue(diff.newVal)}</span>
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-4">Données brutes du système</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedLog.old_data && (
                                                <div className="bg-danger/5 border border-danger/20 rounded-xl overflow-hidden shadow-sm">
                                                    <div className="bg-danger/10 px-4 py-2 text-sm font-bold text-danger border-b border-danger/20 flex items-center gap-2">
                                                        Données Précédentes
                                                    </div>
                                                    <div className="p-4 overflow-x-auto">
                                                        <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                                                            {JSON.stringify(selectedLog.old_data, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedLog.new_data && (
                                                <div className="bg-success/5 border border-success/20 rounded-xl overflow-hidden shadow-sm">
                                                    <div className="bg-success/10 px-4 py-2 text-sm font-bold text-success border-b border-success/20 flex items-center gap-2">
                                                        Moifications / Nouvelles Données
                                                    </div>
                                                    <div className="p-4 overflow-x-auto">
                                                        <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap">
                                                            {JSON.stringify(selectedLog.new_data, null, 2)}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
