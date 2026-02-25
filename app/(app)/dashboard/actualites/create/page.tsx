"use client";

import { useUser } from "../../../../../lib/hooks/useUser";
import { redirect } from "next/navigation";
import ActualiteForm from "../ActualiteForm";
import { Loader2 } from "lucide-react";

export default function CreateActualitePage() {
    const { user, isLoading } = useUser();

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    if (!user || user.role !== 'ag') {
        redirect("/accueil");
    }

    return <ActualiteForm />;
}
