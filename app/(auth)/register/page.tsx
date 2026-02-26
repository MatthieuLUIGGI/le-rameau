"use client";

import { Building2, User, Mail, Lock, Building, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerSchema } from "../../../lib/validations";
import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "../../../hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../../components/ui/form";
import { DEMO_MODE } from "../../../lib/demo-data";
import { Checkbox } from "../../../components/ui/checkbox";
import { logAction } from "../../../lib/logger";

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            prenom: "",
            nom: "",
            email: "",
            password: "",
            confirmPassword: "",
            batiment: "",
            appartement: "",
        },
    });

    const passwordValue = form.watch("password") || "";

    const strengthScore = (() => {
        let score = 0;
        if (!passwordValue) return 0;
        if (passwordValue.length >= 8) score += 1;
        if (/[A-Z]/.test(passwordValue)) score += 1;
        if (/[a-z]/.test(passwordValue)) score += 1;
        if (/[0-9]/.test(passwordValue)) score += 1;
        if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
        return score;
    })();

    const getStrengthColor = (s: number) => {
        if (s === 0) return "bg-transparent";
        if (s <= 2) return "bg-destructive";
        if (s <= 4) return "bg-amber-500";
        return "bg-green-500";
    };

    async function onSubmit(data: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                toast({ title: "Inscription réussie", description: "Mode démo activé." });
                router.push("/accueil");
                return;
            }

            const supabase = createClient();
            const { error: signUpError, data: authData } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        prenom: data.prenom,
                        nom: data.nom,
                        batiment: data.batiment,
                        appartement: data.appartement,
                    }
                }
            });

            if (signUpError) {
                if (signUpError.message === "User already registered" || signUpError.message.includes("already registered")) {
                    router.push('/login?exists=true');
                    return;
                }
                throw signUpError;
            }

            if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
                // Email est déjà utilisé et prévient l'énumération par email
                router.push('/login?exists=true');
                return;
            }

            if (authData.user) {
                await logAction('Création', authData.user.id, `${data.prenom} ${data.nom}`, data.email);
            }

            router.push('/login?registered=true');
        } catch (error: any) {
            if (error?.message === "User already registered" || error?.message?.includes("already registered")) {
                router.push('/login?exists=true');
                return;
            }
            toast({
                title: "Erreur d'inscription",
                description: error?.message || "Une erreur s'est produite lors de la création de votre compte.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4 py-12">
            <div className="w-full max-w-xl">
                <div className="flex flex-col items-center mb-8">
                    <Building2 className="h-12 w-12 text-primary mb-4" />
                    <h1 className="text-3xl font-bold text-primary text-center">Créer votre compte</h1>
                    <p className="text-muted-foreground text-center mt-2">Rejoignez la communauté de votre résidence</p>
                </div>

                <Card className="shadow-lg border-none">
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="prenom" render={({ field }) => (
                                        <FormItem>
                                            <Label>Prénom</Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                                                <FormControl><Input className="pl-10" placeholder="Jean" {...field} /></FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="nom" render={({ field }) => (
                                        <FormItem>
                                            <Label>Nom</Label>
                                            <FormControl><Input placeholder="Dupont" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <Label>Adresse email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                                            <FormControl><Input className="pl-10" placeholder="jean.dupont@email.com" {...field} /></FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <Label>Mot de passe</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                                                <FormControl><Input className="pl-10" type="password" placeholder="••••••••" {...field} /></FormControl>
                                            </div>
                                            {passwordValue && (
                                                <div className="mt-2 text-xs">
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-1 flex">
                                                        <div
                                                            className={`h-full transition-all duration-300 ${getStrengthColor(strengthScore)}`}
                                                            style={{ width: `${(strengthScore / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className={`text-[10px] leading-tight ${strengthScore === 5 ? 'text-green-600 font-semibold' : 'text-muted-foreground'}`}>
                                                        8 caractères min, majuscule, minuscule, chiffre, et caractère spécial requis.
                                                    </p>
                                                </div>
                                            )}
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem>
                                            <Label>Confirmer mdp</Label>
                                            <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="border-t border-border my-6 pt-4">
                                    <h3 className="text-sm font-semibold text-primary mb-4 flex items-center"><Building className="h-4 w-4 mr-2" /> Informations résidence</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="batiment" render={({ field }) => (
                                            <FormItem>
                                                <Label>Bâtiment (Optionnel)</Label>
                                                <FormControl><Input placeholder="Ex: B" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="appartement" render={({ field }) => (
                                            <FormItem>
                                                <Label>Numéro appartement</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                                                    <FormControl><Input className="pl-9" placeholder="Ex: B42" {...field} /></FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <FormField control={form.control} name="rgpd" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-xl bg-muted/30 mt-4">
                                        <FormControl>
                                            <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <Label className="text-sm font-medium">J'accepte les conditions d'utilisation</Label>
                                            <p className="text-xs text-muted-foreground">Vos données seront utilisées uniquement dans le cadre de la gestion de votre copropriété.</p>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )} />

                                <Button type="submit" className="w-full bg-primary hover:bg-primary-light text-primary-foreground font-bold text-lg h-14 mt-6" disabled={isLoading}>
                                    {isLoading ? "Création en cours..." : "Créer mon compte"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="text-primary hover:text-primary-light font-bold transition-colors">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}
