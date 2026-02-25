import useSWR from 'swr';
import { createClient } from '../supabase/client';
import { demoAlertes, DEMO_MODE } from '../demo-data';
import { Alerte } from '../../types';

export function useAlertes() {
    const { data, error, mutate, isLoading } = useSWR<Alerte[]>('alertes', async () => {
        if (DEMO_MODE) return demoAlertes;

        const supabase = createClient();
        const { data: alertes, error } = await supabase
            .from('alertes')
            .select('*, auteur:auteur_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return alertes as Alerte[];
    });

    return { alertes: data, isLoading, isError: error, mutate };
}
