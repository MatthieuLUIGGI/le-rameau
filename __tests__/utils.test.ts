import { afterEach, describe, expect, it, vi } from 'vitest';
import { getInitials, openBase64Pdf } from '../lib/utils';

describe('getInitials()', () => {
    it('retourne les initiales en majuscules pour prénom + nom standards', () => {
        expect(getInitials('Matthieu', 'LUIGGI')).toBe('ML');
    });

    it('gère les prénoms composés avec tiret', () => {
        expect(getInitials('Jean-Pierre', 'Dupont')).toBe('JPD');
    });

    it('gère les prénoms composés avec espace', () => {
        expect(getInitials('Marie Claire', 'Martin')).toBe('MCM');
    });

    it('retourne une chaîne vide si aucun argument', () => {
        expect(getInitials()).toBe('');
    });

    it('retourne une chaîne vide si les deux arguments sont null', () => {
        expect(getInitials(null, null)).toBe('');
    });

    it('retourne une chaîne vide si les deux arguments sont des chaînes vides', () => {
        expect(getInitials('', '')).toBe('');
    });

    it('fonctionne si seulement le prénom est fourni', () => {
        expect(getInitials('Alice', null)).toBe('A');
    });

    it('fonctionne si seulement le nom est fourni', () => {
        expect(getInitials(null, 'Dupont')).toBe('D');
    });
});

describe('openBase64Pdf()', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('ne fait rien si aucun fichier n’est fourni', () => {
        const openMock = vi.fn();
        vi.stubGlobal('window', { open: openMock });

        openBase64Pdf(null);

        expect(openMock).not.toHaveBeenCalled();
    });

    it('ouvre directement une URL classique', () => {
        const openMock = vi.fn();
        vi.stubGlobal('window', { open: openMock });

        openBase64Pdf('https://example.com/document.pdf');

        expect(openMock).toHaveBeenCalledWith('https://example.com/document.pdf', '_blank');
    });

    it('convertit un PDF base64 en URL temporaire avant ouverture', () => {
        vi.useFakeTimers();
        const openMock = vi.fn();
        const createObjectURLMock = vi.fn(() => 'blob:document-temporaire');
        const revokeObjectURLMock = vi.fn();
        vi.stubGlobal('window', { open: openMock });
        vi.stubGlobal('URL', {
            createObjectURL: createObjectURLMock,
            revokeObjectURL: revokeObjectURLMock,
        });

        openBase64Pdf('data:application/pdf;base64,SGVsbG8=');
        vi.runAllTimers();

        expect(createObjectURLMock).toHaveBeenCalled();
        expect(openMock).toHaveBeenCalledWith('blob:document-temporaire', '_blank');
        expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:document-temporaire');
    });

    it('utilise le fichier source en solution de secours si le base64 est invalide', () => {
        const openMock = vi.fn();
        vi.stubGlobal('window', { open: openMock });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        openBase64Pdf('data:application/pdf;base64,%%%');

        expect(openMock).toHaveBeenCalledWith('data:application/pdf;base64,%%%', '_blank');
    });
});
