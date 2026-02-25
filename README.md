# Le Rameau - Application de gestion de copropriété

Bienvenue sur le dépôt du projet **Le Rameau**. C'est une application moderne destinée à simplifier la vie en copropriété.

## Prérequis

- Node.js 18+
- npm ou yarn
- Projet Supabase créé avec une base de données PostgreSQL

## Stack technique

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Style**: Tailwind CSS
- **Composants**: shadcn/ui
- **Backend & Auth**: Supabase
- **Validation**: Zod
- **Data Fetching**: SWR

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
   Remplissez les clés d'API (Supabase, OpenWeather).

4. Configurer Supabase :
   Exécutez le script SQL `supabase/schema.sql` dans l'éditeur SQL de votre projet Supabase pour créer toutes les tables, triggers et RLS.

5. Lancer le serveur de développement :
   ```bash
   npm run dev
   ```

## Mode Démo

Si la variable d'environnement `NEXT_PUBLIC_SUPABASE_URL` n'est pas définie, l'application fonctionnera en **Mode Démo** grâce aux données fictives situées dans `lib/demo-data.ts`.

## Fonctionnalités principales

- Dashboard personnalisé avec widgets météo et actions rapides
- Annonces classées par catégories
- Alertes d'urgence en temps réel
- Calendrier partagé
- Messagerie communautaire (Canaux et DMs)
- Annuaire des contacts et rôles

## Déploiement

Le projet est optimisé pour être déployé facilement sur Vercel. Connectez simplement le dépôt et ajoutez les variables d'environnement.
