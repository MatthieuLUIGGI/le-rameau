"use client";

import { useEffect, useState } from "react";
import { useParams, redirect } from "next/navigation";
import { useUser } from "../../../../../../lib/hooks/useUser";
import { createClient } from "../../../../../../lib/supabase/client";
import ActualiteForm from "../../ActualiteForm";
import { Loader2 } from "lucide-react";

export default function EditActualitePage() {
    const params = useParams();
    const id = params.id as string;
    const { user, isLoading: userLoading } = useUser();
    const [initialData, setInitialData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userLoading && (!user || user.role !== 'ag')) {
            redirect("/accueil");
        }
    }, [user, userLoading]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('actualites').select('*').eq('id', id).single();

            if (error || !data) {
                redirect("/dashboard/actualites");
            } else {
                setInitialData(data);
            }
            setIsLoading(false);
        };

        if (!userLoading) fetchData();
    }, [id, userLoading]);

    if (userLoading || isLoading) return <div className="flex justify-center p-12 mt-12"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

    return <ActualiteForm initialData={initialData} />;
}
