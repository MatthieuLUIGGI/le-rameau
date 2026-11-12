import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('schéma SQL des consultations', () => {
    it('limite les votes à une réponse par logement et par consultation', () => {
        const schemaPath = path.resolve(process.cwd(), 'supabase/schema.sql');
        const schema = readFileSync(schemaPath, 'utf8').replace(/\s+/g, ' ');

        expect(schema).toContain(
            'CONSTRAINT unique_vote_par_logement UNIQUE (consultation_id, appartement)'
        );
    });
});
