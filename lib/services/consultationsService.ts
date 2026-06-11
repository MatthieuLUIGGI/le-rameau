import { createClient } from '@/lib/supabase/client';

export interface ConsultationOption {
    id: string;
    texte: string;
}

export interface ConsultationRow {
    id: string;
    question: string;
    options: ConsultationOption[];
    statut: 'actif' | 'termine';
    created_at: string;
}

export type ConsultationInsert = Omit<ConsultationRow, 'id' | 'created_at'>;
export type ConsultationUpdate = Partial<ConsultationInsert>;

export type VoteStats = {
    total: number;
    options: Record<string, number>;
};

export const consultationsService = {
    /** Récupère toutes les consultations avec pagination */
    async getAll(): Promise<ConsultationRow[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('consultations')
            .select('*')
            .order('created_at', { ascending: false })
            .range(0, 49);
        if (error) throw error;
        return (data ?? []) as ConsultationRow[];
    },

    /** Récupère les statistiques de votes pour toutes les consultations */
    async getVoteStats(): Promise<Record<string, VoteStats>> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('consultation_votes')
            .select('consultation_id, option_id');
        if (error) throw error;

        const stats: Record<string, VoteStats> = {};
        (data ?? []).forEach(vote => {
            const cid = String(vote.consultation_id);
            const oid = String(vote.option_id);
            if (!stats[cid]) stats[cid] = { total: 0, options: {} };
            if (!stats[cid].options[oid]) stats[cid].options[oid] = 0;
            stats[cid].total += 1;
            stats[cid].options[oid] += 1;
        });
        return stats;
    },

    /** Crée une nouvelle consultation */
    async create(payload: ConsultationInsert): Promise<ConsultationRow> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('consultations')
            .insert([payload])
            .select('*')
            .single();
        if (error) throw error;
        return data as ConsultationRow;
    },

    /** Met à jour une consultation */
    async update(id: string, payload: ConsultationUpdate): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('consultations')
            .update(payload)
            .eq('id', id);
        if (error) throw error;
    },

    /** Change le statut d'une consultation (actif/terminé) */
    async toggleStatus(id: string, currentStatus: 'actif' | 'termine'): Promise<'actif' | 'termine'> {
        const newStatus = currentStatus === 'actif' ? 'termine' : 'actif';
        await consultationsService.update(id, { statut: newStatus });
        return newStatus;
    },

    /** Supprime une consultation */
    async delete(id: string): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from('consultations')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },
};
