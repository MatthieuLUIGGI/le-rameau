"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Card, CardContent } from "../../../../components/ui/card";
import { Loader2, Search, Calendar, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "../../../../components/ui/button";
import { toast } from "../../../../hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../../components/ui/dialog";
import { logAction } from "../../../../lib/logger";

type Profile = {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string | null;
    appartement: string | null;
    batiment: string | null;
    role: string;
    avatar_url?: string | null;
    created_at?: string;
    updated_at: string;
};

export default function BoardMembersPage() {
    const [members, setMembers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [memberToDelete, setMemberToDelete] = useState<Profile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchMembers = async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('nom');

        if (data) setMembers(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleDeleteMember = async () => {
        if (!memberToDelete) return;
        setIsDeleting(true);

        try {
            const supabase = createClient();

            // Call the PostgreSQL RPC function securely (bypasses RLS thanks to SECURITY DEFINER)
            const { error: rpcError } = await supabase.rpc('delete_user_by_id', { target_user_id: memberToDelete.id });

            if (rpcError) {
                throw new Error(rpcError.message || 'Erreur lors de la suppression');
            }

            await logAction('Suppression', memberToDelete.id, `${memberToDelete.prenom} ${memberToDelete.nom}`, memberToDelete.email, "Compte supprimé par le Board d'Administration", memberToDelete, null);

            toast({ title: "Succès", description: "Le membre a été supprimé définitivement." });
            setMemberToDelete(null);
            fetchMembers(); // Refresh the list
        } catch (error: any) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredMembers = members.filter(m =>
        (m.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (m.prenom?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (m.email?.toLowerCase() || '').includes(search.toLowerCase())
    );

    if (isLoading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-primary mb-2">Membres inscrits</h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Liste complète des résidents ayant un compte.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un membre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-11 bg-surface"
                    />
                </div>
            </div>

            <Card className="bg-surface border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-bold">Nom / Prénom</th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Rôle</th>
                                <th className="px-6 py-4 font-bold">Appartement</th>
                                <th className="px-6 py-4 font-bold">Dernière connexion</th>
                                <th className="px-6 py-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-foreground">
                                        {member.nom} {member.prenom}
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <a href={`mailto:${member.email}`} className="hover:text-primary transition-colors">{member.email}</a>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${member.role === 'ag' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {member.role?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground font-medium">
                                        {member.batiment ? `Bât ${member.batiment} - ` : ''}
                                        {member.appartement ? `Apt ${member.appartement}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="w-4 h-4 opacity-50" />
                                        {format(new Date(member.updated_at), 'dd MMM yyyy, HH:mm', { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Dialog open={memberToDelete?.id === member.id} onOpenChange={(open) => !open && setMemberToDelete(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-danger hover:text-danger hover:bg-danger/10"
                                                    onClick={() => setMemberToDelete(member)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle className="text-danger flex items-center gap-2">
                                                        <AlertTriangle className="h-5 w-5" /> Confirmer la suppression
                                                    </DialogTitle>
                                                </DialogHeader>
                                                <p className="text-muted-foreground mt-2">
                                                    Êtes-vous sûr de vouloir supprimer définitivement le compte de <strong className="text-foreground">{member.prenom} {member.nom}</strong> ? Cette action est irréversible.
                                                </p>
                                                <div className="flex justify-end gap-2 mt-6">
                                                    <Button variant="outline" onClick={() => setMemberToDelete(null)}>Annuler</Button>
                                                    <Button variant="destructive" onClick={handleDeleteMember} disabled={isDeleting}>
                                                        {isDeleting ? "Suppression..." : "Supprimer"}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                                        Aucun membre trouvé correspondant à la recherche.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
