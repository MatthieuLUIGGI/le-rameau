"use client";

import { useUser } from "../../../lib/hooks/useUser";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import { User as UserIcon, LogOut, CheckCircle2, Edit3, Building, Mail, Phone, Info, Upload, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "../../../hooks/use-toast";
import { DEMO_MODE } from "../../../lib/demo-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { logAction } from "../../../lib/logger";

export default function ProfilPage() {
    const { user, mutate } = useUser();
    const router = useRouter();
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state for editing
    const [editForm, setEditForm] = useState({
        prenom: '',
        nom: '',
        password: '',
        avatar_url: '',
        batiment: '',
        appartement: ''
    });

    const handleEditOpen = () => {
        setEditForm({
            prenom: user?.prenom || '',
            nom: user?.nom || '',
            password: '',
            avatar_url: user?.avatar_url || '',
            batiment: user?.batiment || '',
            appartement: user?.appartement || ''
        });
        setOpenEdit(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (!DEMO_MODE && user) {
                const supabase = createClient();
                const { error } = await supabase.from('profiles').update({
                    nom: editForm.nom,
                    prenom: editForm.prenom,
                    avatar_url: editForm.avatar_url,
                    batiment: editForm.batiment,
                    appartement: editForm.appartement
                }).eq('id', user.id);
                if (error) throw error;

                if (editForm.password) {
                    const { error: pwError } = await supabase.auth.updateUser({ password: editForm.password });
                    if (pwError) throw pwError;
                }

                const new_data = {
                    nom: editForm.nom,
                    prenom: editForm.prenom,
                    avatar_url: editForm.avatar_url,
                    batiment: editForm.batiment,
                    appartement: editForm.appartement
                };

                await logAction('Modification', user.id, `${user.prenom} ${user.nom}`, user.email, "Mise à jour du profil", user, new_data);
                await mutate();
            }
            toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées avec succès." });
            setOpenEdit(false);
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => setEditForm(prev => ({ ...prev, avatar_url: event.target?.result as string }));
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            if (!DEMO_MODE && user) {
                const supabase = createClient();

                await logAction('Suppression', user.id, `${user.prenom} ${user.nom}`, user.email, "Compte supprimé par l'utilisateur");

                const { error } = await supabase.rpc('delete_user');
                if (error) throw error;
                await supabase.auth.signOut();
            }
            toast({ title: "Compte supprimé", description: "Votre compte a été définitivement effacé." });
            setOpenDelete(false);
            router.push('/');
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de supprimer le compte.", variant: "destructive" });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLogout = async () => {
        if (DEMO_MODE) {
            router.push("/");
            return;
        }
        const supabase = createClient();

        if (user) {
            await logAction('Déconnexion', user.id, `${user.prenom} ${user.nom}`, user.email);
        }

        await supabase.auth.signOut();
        toast({ title: "Déconnexion réussie" });
        router.push("/");
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-12 pt-6">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-extrabold text-primary">Mon Profil</h1>
                <div className="flex gap-2">
                    <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="font-bold shadow-sm" onClick={handleEditOpen}>
                                <Edit3 className="mr-2 h-4 w-4" /> Modifier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Modifier mon profil</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1 scrollbar-none">
                                <div className="space-y-2">
                                    <Label>Photo de profil</Label>
                                    <div
                                        onDrop={handleAvatarDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() => document.getElementById('avatar-upload')?.click()}
                                        className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                                    >
                                        {editForm.avatar_url ? (
                                            <img src={editForm.avatar_url} alt="Avatar Preview" className="w-16 h-16 rounded-full mx-auto mb-2 object-cover" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                        )}
                                        <p className="text-sm text-muted-foreground">Glissez une photo ou cliquez ici</p>
                                        <input type="file" id="avatar-upload" className="hidden" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => setEditForm(prev => ({ ...prev, avatar_url: event.target?.result as string }));
                                                reader.readAsDataURL(file);
                                            }
                                        }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Prénom</Label>
                                        <Input
                                            value={editForm.prenom}
                                            onChange={(e) => setEditForm({ ...editForm, prenom: e.target.value })}
                                            placeholder="Jean"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nom</Label>
                                        <Input
                                            value={editForm.nom}
                                            onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                                            placeholder="Dupont"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bâtiment</Label>
                                        <Input
                                            value={editForm.batiment}
                                            onChange={(e) => setEditForm({ ...editForm, batiment: e.target.value })}
                                            placeholder="A"
                                            disabled
                                            className="opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Appartement</Label>
                                        <Input
                                            value={editForm.appartement}
                                            onChange={(e) => setEditForm({ ...editForm, appartement: e.target.value })}
                                            placeholder="A12"
                                            disabled
                                            className="opacity-50 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 border-t border-border pt-4 mt-2">
                                    <Label>Nouveau mot de passe (Optionnel)</Label>
                                    <Input
                                        type="password"
                                        value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder="Laissez vide pour ne pas modifier"
                                    />
                                </div>
                                <Button type="submit" className="w-full bg-primary hover:bg-primary-light text-primary-foreground font-bold mt-4" disabled={isLoading}>
                                    {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                    <Button variant="destructive" onClick={handleLogout} className="font-bold shadow-sm">
                        <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </Button>
                </div>
            </div>

            <Card className="bg-gradient-to-br from-primary to-primary-light text-white overflow-hidden border-none shadow-xl">
                <CardContent className="p-8 sm:p-12 relative flex flex-col md:flex-row items-center gap-8">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <UserIcon className="w-64 h-64 -mt-16 -mr-16" />
                    </div>

                    <div className="relative shrink-0">
                        <Avatar className="h-32 w-32 border-4 border-white/20 shadow-xl bg-white text-primary">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback className="text-5xl font-black">{user.prenom[0]}{user.nom[0]}</AvatarFallback>
                        </Avatar>
                        {user.is_verified && (
                            <div className="absolute bottom-1 right-1 bg-success text-white rounded-full p-1.5 shadow-sm border-2 border-primary-light" title="Compte vérifié">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left z-10">
                        <h2 className="text-3xl sm:text-4xl font-black mb-2 tracking-tight">{user.prenom} {user.nom}</h2>
                        <p className="text-primary-foreground/80 text-lg font-medium mb-6 uppercase tracking-widest">{user.role}</p>
                        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                            <Building className="h-5 w-5 opacity-70" />
                            <span className="font-semibold">Bât {user.batiment || "-"} — Apt. {user.appartement || "-"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-surface shadow-sm border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                            <UserIcon className="h-5 w-5" /> Informations Personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <div className="flex items-center gap-3 mb-2">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Adresse email</p>
                            </div>
                            <p className="font-medium text-foreground text-lg ml-8">{user.email}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-surface shadow-sm border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-primary">
                            <Building className="h-5 w-5" /> Copropriété
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-xl border border-border">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Inscrit depuis</p>
                            <p className="font-bold text-foreground text-lg">{format(new Date(user.created_at), "MMMM yyyy", { locale: fr })}</p>
                        </div>
                        <div
                            className="bg-muted/30 p-4 rounded-xl border border-border flex items-start gap-4 cursor-pointer hover:bg-muted/50 transition-colors group"
                            onClick={() => router.push('/contactez-nous')}
                        >
                            <div className="bg-primary/10 p-3 rounded-lg text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                <Info className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground group-hover:text-primary transition-colors">Besoin d'aide ?</p>
                                <p className="text-sm text-muted-foreground font-medium mt-1">Contactez votre syndic ou administrateur pour modifier vos informations.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-surface shadow-sm border-danger/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold text-danger">
                        <AlertTriangle className="h-5 w-5" /> Zone Dangereuse
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground w-full sm:max-w-[70%]">
                        La suppression de votre compte est irréversible. Toutes vos données personnelles et vos annonces seront effacées de nos serveurs.
                    </p>
                    <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="font-bold w-full sm:w-auto shrink-0 shadow-sm">
                                <Trash2 className="h-4 w-4 mr-2" /> Supprimer le compte
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-danger flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" /> Êtes-vous absolument sûr ?
                                </DialogTitle>
                            </DialogHeader>
                            <p className="text-muted-foreground mt-2">
                                Cette action supprimera définitivement votre compte, vos annonces et tous vos accès. Ceci ne peut pas être annulé.
                            </p>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" onClick={() => setOpenDelete(false)}>Annuler</Button>
                                <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
                                    {isDeleting ? "Suppression..." : "Oui, supprimer definitivement"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
