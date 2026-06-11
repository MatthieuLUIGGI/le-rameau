import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../lib/validations';

describe('loginSchema', () => {
    it('accepte un email et mot de passe valides', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: 'password123' });
        expect(result.success).toBe(true);
    });

    it('rejette un email invalide', () => {
        const result = loginSchema.safeParse({ email: 'pas-un-email', password: 'password123' });
        expect(result.success).toBe(false);
        expect(result.error?.issues[0].message).toBe('Email invalide');
    });

    it('rejette un mot de passe trop court (< 6 chars)', () => {
        const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' });
        expect(result.success).toBe(false);
    });
});

describe('registerSchema', () => {
    const validData = {
        prenom: 'Matthieu',
        nom: 'LUIGGI',
        email: 'matthieu@example.com',
        password: 'Motdepasse1!',
        confirmPassword: 'Motdepasse1!',
        batiment: 'A',
        appartement: '12',
        rgpd: true as const,
    };

    it('accepte un formulaire complet valide', () => {
        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
    });

    it('rejette si le mot de passe manque de majuscule', () => {
        const result = registerSchema.safeParse({ ...validData, password: 'motdepasse1!', confirmPassword: 'motdepasse1!' });
        expect(result.success).toBe(false);
        const messages = result.error?.issues.map(i => i.message);
        expect(messages).toContain('Le mot de passe doit contenir au moins une majuscule');
    });

    it('rejette si le mot de passe manque de chiffre', () => {
        const result = registerSchema.safeParse({ ...validData, password: 'Motdepasse!', confirmPassword: 'Motdepasse!' });
        expect(result.success).toBe(false);
        const messages = result.error?.issues.map(i => i.message);
        expect(messages).toContain('Le mot de passe doit contenir au moins un chiffre');
    });

    it('rejette si le mot de passe manque de caractère spécial', () => {
        const result = registerSchema.safeParse({ ...validData, password: 'Motdepasse1', confirmPassword: 'Motdepasse1' });
        expect(result.success).toBe(false);
        const messages = result.error?.issues.map(i => i.message);
        expect(messages).toContain('Le mot de passe doit contenir au moins un caractère spécial');
    });

    it('rejette si le mot de passe fait moins de 8 caractères', () => {
        const result = registerSchema.safeParse({ ...validData, password: 'Aa1!', confirmPassword: 'Aa1!' });
        expect(result.success).toBe(false);
    });

    it('rejette si les mots de passe ne correspondent pas', () => {
        const result = registerSchema.safeParse({ ...validData, confirmPassword: 'AutreMotdepasse1!' });
        expect(result.success).toBe(false);
        const messages = result.error?.issues.map(i => i.message);
        expect(messages).toContain('Les mots de passe ne correspondent pas');
    });

    it('rejette si rgpd est false', () => {
        const result = registerSchema.safeParse({ ...validData, rgpd: false });
        expect(result.success).toBe(false);
    });

    it('rejette si le prénom est trop court', () => {
        const result = registerSchema.safeParse({ ...validData, prenom: 'A' });
        expect(result.success).toBe(false);
        const messages = result.error?.issues.map(i => i.message);
        expect(messages).toContain('Prénom trop court');
    });
});
