import useSWR from 'swr';
import { createClient } from '../supabase/client';
import { getCurrentUser, DEMO_MODE } from '../demo-data';
import { User } from '../../types';

export function useUser() {
    const { data, error, mutate, isLoading } = useSWR<User | null>('user', async () => {
        if (DEMO_MODE) return getCurrentUser();

        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (!profile) return null;

        return {
            ...profile,
            email: session.user.email
        } as User;
    });

    return { user: data, isLoading, isError: error, mutate };
}
