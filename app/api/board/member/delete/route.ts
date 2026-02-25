import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'L\'ID de l\'utilisateur est requis.' }, { status: 400 });
        }

        // Vérification basique de la session via le header (fourni par le frontend)
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Création du client admin Supabase pour contourner les règles RLS (Row Level Security)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Suppression de l'utilisateur de l'authentification globale (auth.users)
        // La suppression en cascade (ON DELETE CASCADE) gérera la table 'profiles' et le reste.
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Utilisateur supprimé avec succès.' });

    } catch (error: any) {
        console.error('Erreur lors de la suppression de membre:', error);
        return NextResponse.json({ error: error.message || 'Erreur interne du serveur' }, { status: 500 });
    }
}
