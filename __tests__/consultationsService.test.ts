import { beforeEach, describe, expect, it, vi } from 'vitest';
import { consultationsService } from '../lib/services/consultationsService';

const { createClientMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
}));

vi.mock('@/lib/supabase/client', () => ({
    createClient: createClientMock,
}));

describe('consultationsService.getVoteStats()', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('regroupe les votes par consultation et par option', async () => {
        const selectMock = vi.fn().mockResolvedValue({
            data: [
                { consultation_id: 'consultation-a', option_id: 'oui' },
                { consultation_id: 'consultation-a', option_id: 'non' },
                { consultation_id: 'consultation-a', option_id: 'oui' },
                { consultation_id: 'consultation-b', option_id: 'abstention' },
            ],
            error: null,
        });
        const fromMock = vi.fn(() => ({ select: selectMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        const stats = await consultationsService.getVoteStats();

        expect(stats).toEqual({
            'consultation-a': {
                total: 3,
                options: {
                    oui: 2,
                    non: 1,
                },
            },
            'consultation-b': {
                total: 1,
                options: {
                    abstention: 1,
                },
            },
        });
    });

    it('ne récupère que les champs nécessaires au calcul des résultats', async () => {
        const selectMock = vi.fn().mockResolvedValue({ data: [], error: null });
        const fromMock = vi.fn(() => ({ select: selectMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        await consultationsService.getVoteStats();

        expect(fromMock).toHaveBeenCalledWith('consultation_votes');
        expect(selectMock).toHaveBeenCalledWith('consultation_id, option_id');
    });

    it('remonte une erreur Supabase au lieu de masquer un problème de récupération', async () => {
        const error = new Error('Lecture impossible');
        const selectMock = vi.fn().mockResolvedValue({ data: null, error });
        const fromMock = vi.fn(() => ({ select: selectMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        await expect(consultationsService.getVoteStats()).rejects.toThrow('Lecture impossible');
    });
});

describe('consultationsService.getAll()', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('récupère les 50 dernières consultations dans l’ordre attendu', async () => {
        const data = [
            {
                id: 'consultation-1',
                question: 'Faut-il changer le digicode ?',
                options: [{ id: 'oui', texte: 'Oui' }],
                statut: 'actif',
                created_at: '2026-07-01',
            },
        ];
        const rangeMock = vi.fn().mockResolvedValue({ data, error: null });
        const orderMock = vi.fn(() => ({ range: rangeMock }));
        const selectMock = vi.fn(() => ({ order: orderMock }));
        const fromMock = vi.fn(() => ({ select: selectMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        const consultations = await consultationsService.getAll();

        expect(consultations).toEqual(data);
        expect(fromMock).toHaveBeenCalledWith('consultations');
        expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
        expect(rangeMock).toHaveBeenCalledWith(0, 49);
    });
});

describe('consultationsService.create()', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('crée une consultation avec une question, des options et un statut', async () => {
        const payload = {
            question: 'Souhaitez-vous ajouter un compost collectif ?',
            options: [
                { id: 'oui', texte: 'Oui' },
                { id: 'non', texte: 'Non' },
            ],
            statut: 'actif' as const,
        };
        const created = { id: 'consultation-3', created_at: '2026-07-02', ...payload };
        const singleMock = vi.fn().mockResolvedValue({ data: created, error: null });
        const selectMock = vi.fn(() => ({ single: singleMock }));
        const insertMock = vi.fn(() => ({ select: selectMock }));
        const fromMock = vi.fn(() => ({ insert: insertMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        const result = await consultationsService.create(payload);

        expect(result).toEqual(created);
        expect(insertMock).toHaveBeenCalledWith([payload]);
    });
});

describe('consultationsService.toggleStatus()', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('clôture une consultation active', async () => {
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn(() => ({ eq: eqMock }));
        const fromMock = vi.fn(() => ({ update: updateMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        const newStatus = await consultationsService.toggleStatus('consultation-1', 'actif');

        expect(newStatus).toBe('termine');
        expect(fromMock).toHaveBeenCalledWith('consultations');
        expect(updateMock).toHaveBeenCalledWith({ statut: 'termine' });
        expect(eqMock).toHaveBeenCalledWith('id', 'consultation-1');
    });

    it('réouvre une consultation terminée', async () => {
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const updateMock = vi.fn(() => ({ eq: eqMock }));
        const fromMock = vi.fn(() => ({ update: updateMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        const newStatus = await consultationsService.toggleStatus('consultation-2', 'termine');

        expect(newStatus).toBe('actif');
        expect(updateMock).toHaveBeenCalledWith({ statut: 'actif' });
    });
});

describe('consultationsService.delete()', () => {
    beforeEach(() => {
        createClientMock.mockReset();
    });

    it('supprime une consultation par son identifiant', async () => {
        const eqMock = vi.fn().mockResolvedValue({ error: null });
        const deleteMock = vi.fn(() => ({ eq: eqMock }));
        const fromMock = vi.fn(() => ({ delete: deleteMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        await consultationsService.delete('consultation-4');

        expect(fromMock).toHaveBeenCalledWith('consultations');
        expect(eqMock).toHaveBeenCalledWith('id', 'consultation-4');
    });
});
