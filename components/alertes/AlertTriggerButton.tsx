"use client";

import { useUser } from "../../lib/hooks/useUser";
import { Button } from "../ui/button";
import { AlertTriangle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { AlertForm } from "./AlertForm";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export function AlertTriggerButton() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const shouldOpen = searchParams.get('create') === 'true';
    const [open, setOpen] = useState(shouldOpen);

    // Hidden for regular residents
    if (user?.role === 'resident') return null;

    return (
        <div className="flex justify-center mb-8">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="destructive" size="lg" className="w-full max-w-md h-16 text-lg font-bold shadow-lg animate-pulse hover:animate-none">
                        <AlertTriangle className="mr-3 h-6 w-6" />
                        🚨 DÉCLENCHER UNE ALERTE
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-surface">
                    <DialogHeader>
                        <DialogTitle className="text-danger flex items-center text-xl">
                            <AlertTriangle className="mr-2 h-6 w-6" />
                            Signaler une urgence
                        </DialogTitle>
                        <DialogDescription>
                            Alertez vos voisins et les gestionnaires en cas de problème grave. Tous les résidents seront notifiés.
                        </DialogDescription>
                    </DialogHeader>
                    <AlertForm onSuccess={() => setOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
