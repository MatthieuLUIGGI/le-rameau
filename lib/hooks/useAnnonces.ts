import useSWR from 'swr';
import { createClient } from '../supabase/client';
import { demoAnnonces, DEMO_MODE } from '../demo-data';
import { Annonce } from '../../types';

export function useAnnonces() {
    const { data, error, mutate, isLoading } = useSWR<Annonce[]>('annonces', async () => {
        if (DEMO_MODE) return demoAnnonces;

        const supabase = createClient();
        const { data: annonces, error } = await supabase
            .from('annonces')
            .select('*, auteur:auteur_id(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return annonces as Annonce[];
    });

    return { annonces: data, isLoading, isError: error, mutate };
}
