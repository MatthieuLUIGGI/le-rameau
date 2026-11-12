import { beforeEach, describe, expect, it, vi } from 'vitest';

const { createClientMock } = vi.hoisted(() => ({
    createClientMock: vi.fn(),
}));

vi.mock('../lib/supabase/client', () => ({
    createClient: createClientMock,
}));

import { logAction, sanitizeData } from '../lib/logger';

beforeEach(() => {
    createClientMock.mockReset();
    vi.restoreAllMocks();
});

describe('sanitizeData()', () => {
    it('retourne null si la donnée est null', () => {
        expect(sanitizeData(null)).toBeNull();
    });

    it('retourne undefined si la donnée est undefined', () => {
        expect(sanitizeData(undefined)).toBeUndefined();
    });

    it('ne modifie pas les champs courts (≤ 500 chars)', () => {
        const data = { image_url: 'https://example.com/img.jpg', contenu: 'Texte court' };
        const result = sanitizeData(data);
        expect(result?.image_url).toBe('https://example.com/img.jpg');
        expect(result?.contenu).toBe('Texte court');
    });

    it('tronque image_url si > 500 chars (base64)', () => {
        const longBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(600);
        const result = sanitizeData({ image_url: longBase64 });
        const truncated = result?.image_url as string;
        expect(truncated.length).toBeLessThan(longBase64.length);
        expect(truncated).toContain('[TRONQUÉ]');
    });

    it('tronque le champ contenu si > 500 chars', () => {
        const longText = 'A'.repeat(600);
        const result = sanitizeData({ contenu: longText });
        const truncated = result?.contenu as string;
        expect(truncated).toContain('[TRONQUÉ]');
        expect(truncated.length).toBeLessThan(600);
    });

    it('tronque pdf_url si > 500 chars', () => {
        const longPdf = 'data:application/pdf;base64,' + 'B'.repeat(600);
        const result = sanitizeData({ pdf_url: longPdf });
        expect((result?.pdf_url as string)).toContain('[TRONQUÉ]');
    });

    it('ne modifie pas les autres champs non ciblés', () => {
        const data = { titre: 'Mon titre', auteur: 'Admin', note: 'A'.repeat(600) };
        const result = sanitizeData(data);
        // 'note' n'est pas dans keysToTruncate → non tronqué
        expect(result?.titre).toBe('Mon titre');
        expect((result?.note as string).length).toBe(600);
    });

    it("ne mute pas l'objet original", () => {
        const longBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(600);
        const original = { image_url: longBase64 };
        sanitizeData(original);
        expect(original.image_url.length).toBe(longBase64.length);
    });
});

describe('logAction()', () => {
    it('enregistre une action utilisateur en nettoyant les données longues', async () => {
        const insertMock = vi.fn().mockResolvedValue({ error: null });
        const fromMock = vi.fn(() => ({ insert: insertMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        await logAction(
            'Création',
            'user-1',
            'Matthieu LUIGGI',
            'matthieu@example.com',
            'Création d’une actualité',
            { contenu: 'A'.repeat(600) },
            { image_url: 'data:image/jpeg;base64,' + 'B'.repeat(600) }
        );

        expect(fromMock).toHaveBeenCalledWith('user_logs');
        expect(insertMock).toHaveBeenCalledWith([
            expect.objectContaining({
                user_id: 'user-1',
                user_name: 'Matthieu LUIGGI',
                user_email: 'matthieu@example.com',
                action_type: 'Création',
                details: 'Création d’une actualité',
            }),
        ]);

        const payload = insertMock.mock.calls[0][0][0];
        expect(payload.old_data.contenu).toContain('[TRONQUÉ]');
        expect(payload.new_data.image_url).toContain('[TRONQUÉ]');
    });

    it('ne bloque pas l’action principale si Supabase refuse le log', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const insertMock = vi.fn().mockResolvedValue({ error: new Error('Accès refusé') });
        const fromMock = vi.fn(() => ({ insert: insertMock }));
        createClientMock.mockReturnValue({ from: fromMock });

        await expect(logAction('Connexion', 'user-1', 'Matthieu', 'matthieu@example.com')).resolves.toBeUndefined();
        expect(consoleErrorSpy).toHaveBeenCalled();
    });
});
