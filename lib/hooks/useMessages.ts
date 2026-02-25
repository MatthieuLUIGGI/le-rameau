import useSWR from 'swr';
import { createClient } from '../supabase/client';
import { demoMessages, demoCanaux, DEMO_MODE } from '../demo-data';
import { Message, Canal } from '../../types';

export function useMessages(canalId?: string) {
    const { data: canaux, error: errorCanaux } = useSWR<Canal[]>('canaux', async () => {
        if (DEMO_MODE) return demoCanaux;

        const supabase = createClient();
        const { data, error } = await supabase
            .from('canaux')
            .select('*')
            .order('nom');

        if (error) throw error;
        return data as Canal[];
    });

    const { data: messages, error: errorMessages, mutate, isLoading } = useSWR<Message[]>(
        canalId ? `messages-${canalId}` : null,
        async () => {
            if (DEMO_MODE) return demoMessages.filter(m => m.canal_id === canalId);

            const supabase = createClient();
            const { data, error } = await supabase
                .from('messages')
                .select('*, auteur:auteur_id(*)')
                .eq('canal_id', canalId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data as Message[];
        }
    );

    return {
        canaux,
        messages,
        isLoading,
        isError: errorCanaux || errorMessages,
        mutate
    };
}
