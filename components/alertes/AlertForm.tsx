"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { alerteSchema } from "../../lib/validations";
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
import { Flame, Droplets, ArrowUpDown, Shield, Zap, AlertCircle } from "lucide-react";

export function AlertForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const form = useForm<z.infer<typeof alerteSchema>>({
        resolver: zodResolver(alerteSchema),
        defaultValues: {
            titre: "",
            description: "",
            categorie: "autre",
        },
    });

    async function onSubmit(data: z.infer<typeof alerteSchema>) {
        setIsLoading(true);
        try {
            if (DEMO_MODE) {
                toast({ title: "Mode Démo", description: "L'alerte a été 'déclenchée' avec succès !" });
                onSuccess?.();
                return;
            }

            const supabase = createClient();
            const { error } = await supabase.from('alertes').insert({
                ...data,
                auteur_id: user?.id,
                residence_id: user?.residence_id, // assuming fetched and available
            });

            if (error) throw error;
            toast({ title: "Urgence signalée", description: "L'alerte a été envoyée à tous les résidents." });
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast({ title: "Erreur", description: "Une erreur est survenue.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const categoryOptions = [
        { value: "incendie", label: "Incendie", icon: Flame, color: "text-danger" },
        { value: "degat_eau", label: "Dégât des eaux", icon: Droplets, color: "text-blue-500" },
        { value: "ascenseur", label: "Panne d'ascenseur", icon: ArrowUpDown, color: "text-warning" },
        { value: "intrusion", label: "Intrusion", icon: Shield, color: "text-danger" },
        { value: "coupure", label: "Coupure", icon: Zap, color: "text-yellow-500" },
        { value: "autre", label: "Autre", icon: AlertCircle, color: "text-muted-foreground" },
    ];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="titre" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Titre de l'alerte</FormLabel>
                        <FormControl><Input placeholder="Ex: Fuite d'eau bâtiment A..." {...field} /></FormControl>
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
                                {categoryOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <div className="flex items-center gap-2">
                                            <opt.icon className={`h-4 w-4 ${opt.color}`} /> {opt.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea className="min-h-[100px]" placeholder="Détails de l'incident..." {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <Button type="submit" disabled={isLoading} variant="destructive" className="w-full text-lg font-bold">
                    {isLoading ? "Envoi en cours..." : "Envoyer l'alerte à tous les résidents"}
                </Button>
            </form>
        </Form>
    );
}
