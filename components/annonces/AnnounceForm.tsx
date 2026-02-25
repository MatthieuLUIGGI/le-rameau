"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { announceSchema } from "../../lib/validations";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useUser } from "../../lib/hooks/useUser";
import { toast } from "../../hooks/use-toast";
import { DEMO_MODE } from "../../lib/demo-data";

export function AnnounceForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const form = useForm<z.infer<typeof announceSchema>>({
        resolver: zodResolver(announceSchema),
        defaultValues: {
            titre: "",
            contenu: "",
            categorie: "information",
            is_important: false,
        },
    });

    async function onSubmit(data: z.infer<typeof announceSchema>) {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                toast({ title: "Mode Démo", description: "L'annonce a été 'créée' avec succès !" });
                onSuccess?.();
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.from('annonces').insert({
                ...data,
                auteur_id: user?.id,
                residence_id: user?.residence_id, // assuming it's fetched and available
            });

            if (error) throw error;
            toast({ title: "Succès", description: "Votre annonce a été publiée." });
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="titre" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl><Input placeholder="Titre de l'annonce..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="categorie" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Catégorie</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="travaux">Travaux</SelectItem>
                                <SelectItem value="information">Information</SelectItem>
                                <SelectItem value="assemblee">Assemblée générale</SelectItem>
                                <SelectItem value="divers">Divers</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="contenu" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contenu</FormLabel>
                        <FormControl><Textarea className="min-h-[100px]" placeholder="Détails de l'annonce..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary-light">
                    {isLoading ? "Publication..." : "Publier l'annonce"}
                </Button>
            </form>
        </Form>
    );
}
