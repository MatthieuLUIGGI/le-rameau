import { User, Residence, Annonce, Alerte, Evenement, Canal, Message, Contact, WeatherDay } from '../types';

export const DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL;

export const demoResidence: Residence = {
    id: 'res_1',
    nom: 'Résidence Les Tilleuls',
    adresse: '15 rue des Tilleuls',
    code_postal: '75015',
    ville: 'Paris',
    latitude: 48.8566,
    longitude: 2.3522,
    couleur_principale: '#1F3864'
};

export const demoUsers: User[] = [
    { id: 'usr_1', email: 'jean.dupont@email.com', nom: 'Dupont', prenom: 'Jean', role: 'resident', appartement: 'A12', batiment: 'A', is_verified: true, created_at: new Date().toISOString() },
    { id: 'usr_2', email: 'marie.curie@email.com', nom: 'Curie', prenom: 'Marie', role: 'admin', appartement: 'B01', batiment: 'B', is_verified: true, created_at: new Date().toISOString() },
    { id: 'usr_3', email: 'luc.martin@email.com', nom: 'Martin', prenom: 'Luc', role: 'conseil', appartement: 'A34', batiment: 'A', is_verified: true, created_at: new Date().toISOString() },
    { id: 'usr_4', email: 'sophie.bernard@email.com', nom: 'Bernard', prenom: 'Sophie', role: 'resident', appartement: 'C10', batiment: 'C', is_verified: true, created_at: new Date().toISOString() },
    { id: 'usr_5', email: 'pierre.durand@email.com', nom: 'Durand', prenom: 'Pierre', role: 'super_admin', is_verified: true, created_at: new Date().toISOString() },
];

export const demoAnnonces: Annonce[] = [
    { id: 'ann_1', titre: 'Coupure d\'eau prévue', contenu: 'Une coupure d\'eau est prévue ce jeudi entre 10h et 12h pour cause de travaux sur le réseau principal.', categorie: 'travaux', auteur_id: 'usr_2', auteur: demoUsers[1], residence_id: 'res_1', is_important: true, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'ann_2', titre: 'Compte-rendu AG', contenu: 'Le compte-rendu de la dernière Assemblée Générale est disponible dans vos boîtes aux lettres.', categorie: 'assemblee', auteur_id: 'usr_3', auteur: demoUsers[2], residence_id: 'res_1', is_important: false, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'ann_3', titre: 'Fête des voisins', contenu: 'N\'oubliez pas notre fête des voisins vendredi soir dans la cour intérieure !', categorie: 'information', auteur_id: 'usr_4', auteur: demoUsers[3], residence_id: 'res_1', is_important: false, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'ann_4', titre: 'Entretien chaudière', contenu: 'Le technicien passera la semaine prochaine pour l\'entretien annuel.', categorie: 'travaux', auteur_id: 'usr_2', auteur: demoUsers[1], residence_id: 'res_1', is_important: true, published_at: new Date().toISOString(), created_at: new Date().toISOString() },
    { id: 'ann_5', titre: 'Objets trouvés', contenu: 'Un trousseau de clés a été retrouvé près de la loge du gardien.', categorie: 'divers', auteur_id: 'usr_1', auteur: demoUsers[0], residence_id: 'res_1', is_important: false, published_at: new Date().toISOString(), created_at: new Date().toISOString() }
];

export const demoAlertes: Alerte[] = [
    { id: 'al_1', titre: 'Fuite parking sous-sol', description: 'Une fuite importante est signalée au niveau -1 du parking B.', categorie: 'degat_eau', statut: 'en_cours', auteur_id: 'usr_1', auteur: demoUsers[0], residence_id: 'res_1', created_at: new Date().toISOString() },
    { id: 'al_2', titre: 'Panne ascenseur bâtiment A', description: 'L\'ascenseur du bâtiment A est en panne depuis ce matin.', categorie: 'ascenseur', statut: 'resolu', auteur_id: 'usr_4', auteur: demoUsers[3], residence_id: 'res_1', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() }
];

export const demoEvenements: Evenement[] = [
    { id: 'evt_1', titre: 'Assemblée Générale', description: 'AG annuelle de la copropriété.', date_debut: new Date(Date.now() + 86400000 * 5).toISOString(), date_fin: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(), lieu: 'Salle polyvalente', auteur_id: 'usr_2', residence_id: 'res_1', participants: [] },
    { id: 'evt_2', titre: 'Fête des voisins', description: 'Apéritif partagé dans la cour.', date_debut: new Date(Date.now() + 86400000 * 10).toISOString(), date_fin: new Date(Date.now() + 86400000 * 10 + 14400000).toISOString(), lieu: 'Cour intérieure', auteur_id: 'usr_4', residence_id: 'res_1', participants: [] },
    { id: 'evt_3', titre: 'Passage électricien', description: 'Vérification des compteurs.', date_debut: new Date(Date.now() + 86400000 * 2).toISOString(), date_fin: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(), lieu: 'Bâtiment A', auteur_id: 'usr_2', residence_id: 'res_1', participants: [] },
    { id: 'evt_4', titre: 'Vide-grenier', description: 'Vide-grenier de quartier.', date_debut: new Date(Date.now() + 86400000 * 20).toISOString(), date_fin: new Date(Date.now() + 86400000 * 20 + 28800000).toISOString(), lieu: 'Rue des Tilleuls', auteur_id: 'usr_1', residence_id: 'res_1', participants: [] }
];

export const demoCanaux: Canal[] = [
    { id: 'can_1', nom: 'Général', description: 'Discussions générales de la résidence', residence_id: 'res_1', is_private: false },
    { id: 'can_2', nom: 'Entraide', description: 'Proposez ou demandez de l\'aide', residence_id: 'res_1', is_private: false },
    { id: 'can_3', nom: 'Vente & Dons', description: 'Petites annonces entre voisins', residence_id: 'res_1', is_private: false },
    { id: 'can_4', nom: 'Animaux', description: 'Pour les propriétaires d\'animaux', residence_id: 'res_1', is_private: false }
];

export const demoMessages: Message[] = [
    { id: 'msg_1', contenu: 'Bonjour à tous !', auteur_id: 'usr_1', auteur: demoUsers[0], canal_id: 'can_1', type: 'texte', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), is_read: true },
    { id: 'msg_2', contenu: 'Salut Jean !', auteur_id: 'usr_4', auteur: demoUsers[3], canal_id: 'can_1', type: 'texte', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), is_read: true },
    { id: 'msg_3', contenu: 'Quelqu\'un a besoin d\'aide pour le bricolage ?', auteur_id: 'usr_3', auteur: demoUsers[2], canal_id: 'can_2', type: 'texte', created_at: new Date(Date.now() - 3600000).toISOString(), is_read: true },
    { id: 'msg_4', contenu: 'Je donne de vieux cartons si ça intéresse.', auteur_id: 'usr_1', auteur: demoUsers[0], canal_id: 'can_3', type: 'texte', created_at: new Date().toISOString(), is_read: false }
];

export const demoContacts: Contact[] = [
    { id: 'ctx_1', nom: 'Paul (Gardien)', role: 'Gardien', telephone: '06 12 34 56 78', email: 'gardien@residence.com', disponibilite: 'Lun-Ven 8h-12h 14h-18h', residence_id: 'res_1', is_public: true, type: 'interne' },
    { id: 'ctx_2', nom: 'Syndic ImmoPlus', role: 'Syndic', telephone: '01 23 45 67 89', email: 'contact@immoplus.fr', disponibilite: 'Lun-Ven 9h-17h', residence_id: 'res_1', is_public: true, type: 'externe' },
    { id: 'ctx_3', nom: 'Plomberie Express', role: 'Plombier', telephone: '06 98 76 54 32', residence_id: 'res_1', is_public: true, type: 'externe' },
    { id: 'ctx_4', nom: 'Électricité 2000', role: 'Électricien', telephone: '06 11 22 33 44', residence_id: 'res_1', is_public: true, type: 'externe' }
];

export const demoWeather: WeatherDay[] = [
    { date: new Date().toISOString(), temp_min: 14, temp_max: 18, description: 'Ensoleillé', icon: '01d' },
    { date: new Date(Date.now() + 86400000 * 1).toISOString(), temp_min: 12, temp_max: 17, description: 'Nuageux', icon: '03d' },
    { date: new Date(Date.now() + 86400000 * 2).toISOString(), temp_min: 10, temp_max: 14, description: 'Pluie', icon: '10d' },
    { date: new Date(Date.now() + 86400000 * 3).toISOString(), temp_min: 8, temp_max: 12, description: 'Averses', icon: '09d' },
    { date: new Date(Date.now() + 86400000 * 4).toISOString(), temp_min: 11, temp_max: 16, description: 'Partiellement nuageux', icon: '02d' },
    { date: new Date(Date.now() + 86400000 * 5).toISOString(), temp_min: 13, temp_max: 19, description: 'Ensoleillé', icon: '01d' }
];

export const getCurrentUser = () => demoUsers[0];
