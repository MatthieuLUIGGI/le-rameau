# Le Rameau - Application de gestion de copropriété

Bienvenue sur le dépôt du projet **Le Rameau**. C'est une application moderne, sécurisée et sur-mesure, destinée à simplifier la communication et la vie en copropriété pour les résidents et le conseil syndical.

## Prérequis

- Node.js 18+
- npm ou yarn
- Projet Supabase configuré avec une base de données PostgreSQL

## Stack technique

- **Framework**: Next.js (App Router)
- **Langage**: TypeScript
- **Style**: Tailwind CSS
- **Composants**: shadcn/ui, Framer Motion
- **Animations & 3D**: Spline
- **Backend, Base de données & Auth**: Supabase
- **Validation**: Zod
- **Icônes**: Lucide React

## Installation

1. Cloner ce dépôt
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Copier le fichier d'environnement et le remplir :
   ```bash
   cp .env.local.example .env.local
   ```
   Remplissez les clés d'API (notamment `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

4. Configurer Supabase :
   Exécutez les scripts SQL (ex: `supabase/schema.sql`, `supabase/new_query.sql`) dans l'éditeur SQL de votre projet Supabase pour créer toutes les tables, triggers et les politiques de sécurité (RLS).

5. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Fonctionnalités principales

L'application est conçue autour des besoins réels d'une copropriété, remplaçant ainsi les affichages papiers traditionnels par un espace numérique centralisé :

- **Espace Public & Landing Page** : Présentation attractive de la résidence avec un design moderne (Dark Luxury) et un assistant robot interactif en 3D (Spline) qui relaye les alertes importantes en temps réel.
- **Tableau de bord Résident** : Accès rapide sécurisé aux actualités, informations du syndic, demandes de badges Vigik et documents officiels.
- **Actualités et Alertes** : Suivi des informations importantes de la copropriété (travaux, coupures d'eau, événements de la vie courante).
- **Espace Documentaire** : Consultation et téléchargement des comptes rendus d'Assemblées Générales et des réunions du Conseil Syndical.
- **Démocratie Participative** : Module de consultations et de sondages internes avec vérification de l'unicité des votes (un seul vote par appartement).
- **Espace Administration (Conseil Syndical)** : Dashboard sécurisé réservé aux administrateurs (membres du conseil) pour gérer les contenus (CRUD des actualités, gestion des documents, création de sondages, personnalisation du message d'accueil du robot) de manière totalement autonome.

## Architecture & Sécurité

- **Authentification robuste** gérée via Supabase Auth.
- **Protection des données** avec la Row-Level Security (RLS) directement sur PostgreSQL, garantissant que chacun n'accède qu'à ce qu'il a le droit de voir.
- **Contrôle d'accès (RBAC)** : séparation stricte entre les profils résidents classiques et les membres de l'assemblée / conseil syndical (rôle `ag`).
- Conformité aux bonnes pratiques d'**accessibilité** (RGAA) et d'**éco-conception**.

## Déploiement

Le projet est optimisé pour être déployé facilement sur Vercel. Connectez simplement votre dépôt Git à Vercel, ajoutez vos variables d'environnement Supabase, et le déploiement continu s'occupera du reste à chaque modification de la branche principale.
