import { describe, it, expect } from 'vitest';
import { sanitizeData } from '../lib/logger';

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
