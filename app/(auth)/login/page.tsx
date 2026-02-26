"use client";

import { Building2, Mail, Lock, MailCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginSchema } from "../../../lib/validations";
import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "../../../hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../../components/ui/form";
import { DEMO_MODE } from "../../../lib/demo-data";
import { logAction } from "../../../lib/logger";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isExisting, setIsExisting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (window.location.search.includes("registered=true")) {
                setIsRegistered(true);
            }
            if (window.location.search.includes("exists=true")) {
                setIsExisting(true);
            }
        }
    }, []);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                toast({ title: "Connexion réussie", description: "Mode démo activé." });
                router.push("/accueil");
                return;
            }

            const supabase = createClient();
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) throw error;

            if (authData.user) {
                const { data: profile } = await supabase.from('profiles').select('prenom, nom').eq('id', authData.user.id).single();
                await logAction('Connexion', authData.user.id, profile ? `${profile.prenom} ${profile.nom}` : 'Utilisateur', authData.user.email!);
            }

            toast({ title: "Connexion réussie", description: "Bienvenue sur Le Rameau !" });
            router.push('/accueil');
        } catch (error) {
            toast({
                title: "Erreur de connexion",
                description: "Vérifiez vos identifiants.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Building2 className="h-12 w-12 text-primary mb-4" />
                    <h1 className="text-3xl font-bold text-primary text-center">Bon retour</h1>
                    <p className="text-muted-foreground text-center mt-2">Connectez-vous à votre espace résident</p>
                </div>

                {isRegistered && (
                    <div className="mb-8 p-6 bg-blue-500/10 border-2 border-blue-500 rounded-xl text-center shadow-lg animate-in slide-in-from-top-4 duration-500">
                        <MailCheck className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-pulse" />
                        <h2 className="text-xl font-extrabold text-blue-500 mb-2">Inscription réussie !</h2>
                        <p className="text-blue-600/90 font-bold text-xl leading-snug">
                            Veuillez vérifier votre boîte mail pour confirmer votre compte.
                        </p>
                        <p className="text-sm text-blue-600/80 mt-2 font-medium">Vous pourrez vous connecter juste après la confirmation.</p>
                    </div>
                )}
                {isExisting && (
                    <div className="mb-8 p-6 bg-amber-500/10 border-2 border-amber-500 rounded-xl text-center shadow-lg animate-in slide-in-from-top-4 duration-500">
                        <UserCheck className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                        <h2 className="text-xl font-extrabold text-amber-600 mb-2">Compte déjà existant</h2>
                        <p className="text-amber-700/90 font-bold text-lg leading-snug">
                            Cette adresse email est déjà associée à un compte.
                        </p>
                        <p className="text-sm text-amber-700/80 mt-2 font-medium">Veuillez vous connecter avec vos identifiants ou réinitialiser votre mot de passe.</p>
                    </div>
                )}

                <Card className="shadow-lg border-none">
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <Label>Adresse email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                                            <FormControl>
                                                <Input className="pl-10" placeholder="jean.dupont@email.com" {...field} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <Label>Mot de passe</Label>
                                            <Link href="#" className="text-xs text-primary hover:text-primary-light font-medium transition-colors">
                                                Mot de passe oublié ?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                                            <FormControl>
                                                <Input className="pl-10" type="password" placeholder="••••••••" {...field} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <Button type="submit" className="w-full mt-6 bg-primary hover:bg-primary-light text-primary-foreground font-bold text-base h-12" disabled={isLoading}>
                                    {isLoading ? "Connexion..." : "Se connecter"}
                                </Button>
                            </form>
                        </Form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-surface px-2 text-muted-foreground font-medium">Ou continuer avec</span></div>
                        </div>

                        <Button variant="outline" type="button" className="w-full h-12 font-semibold">
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                            Google
                        </Button>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground mt-8 font-medium">
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="text-primary hover:text-primary-light font-bold transition-colors">
                        S'inscrire
                    </Link>
                </p>
            </div>
        </div>
    );
}
