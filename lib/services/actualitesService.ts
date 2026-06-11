import { createClient } from '@/lib/supabase/client';

export type ActualitePriorite = 'basse' | 'normale' | 'haute';

export interface ActualiteListItem {
    id: string;
    titre: string;
    priorite: ActualitePriorite;
    created_at: string;
    date_expiration: string | null;
}

export interface ActualiteFull extends ActualiteListItem {
    extrait: string;
    contenu: string;
    image_url: string | null;
    pdf_url: string | null;
}

export type ActualiteInsert = Omit<ActualiteFull, 'id' | 'created_at'>;
export type ActualiteUpdate = Partial<ActualiteInsert>;

export const actualitesService = {
    /** Récupère toutes les actualités (champs liste) — paginé à 50 */
    async getAll(): Promise<ActualiteListItem[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('actualites')
            .select('id, titre, priorite, created_at, date_expiration')
            .order('created_at', { ascending: false })
            .range(0, 49);
        if (error) throw error;
        return (data ?? []) as ActualiteListItem[];
    },

    /** Récupère une actualité complète par son ID */
    async getById(id: string): Promise<ActualiteFull | null> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('actualites')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as ActualiteFull | null;
    },

    /** Crée une nouvelle actualité et retourne l'enregistrement créé */
    async create(payload: ActualiteInsert): Promise<ActualiteFull> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('actualites')
            .insert([payload])
            .select('*')
            .single();
        if (error) throw error;
        return data as ActualiteFull;
    },

    /** Met à jour une actualité existante */
    async update(id: string, payload: ActualiteUpdate): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('actualites')
            .update(payload)
            .eq('id', id);
        if (error) throw error;
    },

    /** Supprime une actualité par son ID et retourne l'enregistrement supprimé */
    async delete(id: string): Promise<Record<string, unknown> | null> {
        const supabase = createClient();
        const { data: toDelete } = await supabase
            .from('actualites')
            .select('*')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('actualites')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return toDelete as Record<string, unknown> | null;
    },

    /** Récupère les actualités visibles (non expirées) pour les résidents */
    async getVisible(): Promise<ActualiteFull[]> {
        const supabase = createClient();
        const now = new Date().toISOString();
        const { data, error } = await supabase
            .from('actualites')
            .select('*')
            .or(`date_expiration.is.null,date_expiration.gt.${now}`)
            .order('created_at', { ascending: false })
            .range(0, 49);
        if (error) throw error;
        return (data ?? []) as ActualiteFull[];
    },
};
