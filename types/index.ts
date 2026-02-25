export type UserRole = 'resident' | 'conseil' | 'admin' | 'super_admin' | 'membre' | 'ag'

export interface User {
    id: string
    email: string
    nom: string
    prenom: string
    role: UserRole
    appartement?: string
    batiment?: string
    telephone?: string
    avatar_url?: string
    is_verified: boolean
    residence_id?: string
    created_at: string
}

export interface Residence {
    id: string
    nom: string
    adresse: string
    code_postal: string
    ville: string
    latitude: number
    longitude: number
    logo_url?: string
    couleur_principale: string
}

export type AnnounceCategory = 'travaux' | 'information' | 'assemblee' | 'divers'

export interface Annonce {
    id: string
    titre: string
    contenu: string
    categorie: AnnounceCategory
    auteur_id: string
    auteur?: User
    residence_id: string
    is_important: boolean
    published_at: string
    created_at: string
    pieces_jointes?: string[]
}

export type AlerteCategory = 'incendie' | 'degat_eau' | 'ascenseur' | 'intrusion' | 'coupure' | 'autre'
export type AlerteStatut = 'en_cours' | 'resolu'

export interface Alerte {
    id: string
    titre: string
    description: string
    categorie: AlerteCategory
    statut: AlerteStatut
    auteur_id: string
    auteur?: User
    residence_id: string
    created_at: string
    resolved_at?: string
}

export interface Evenement {
    id: string
    titre: string
    description: string
    date_debut: string
    date_fin: string
    lieu: string
    auteur_id: string
    residence_id: string
    participants: string[]
}

export interface Message {
    id: string
    contenu: string
    auteur_id: string
    auteur?: User
    canal_id?: string
    destinataire_id?: string
    type: 'texte' | 'image' | 'fichier'
    created_at: string
    is_read: boolean
}

export interface Canal {
    id: string
    nom: string
    description?: string
    residence_id: string
    is_private: boolean
}

export interface Contact {
    id: string
    nom: string
    role: string
    telephone: string
    email?: string
    disponibilite?: string
    residence_id: string
    is_public: boolean
    type: 'interne' | 'externe'
}

export interface WeatherDay {
    date: string
    temp_min: number
    temp_max: number
    description: string
    icon: string
}
