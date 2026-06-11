import { describe, it, expect } from 'vitest';
import { getInitials } from '../lib/utils';

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
