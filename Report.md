# 🔍 Outside-In Review — le-rameau

> 📅 Analyzed: 2026-06-09 | ⏱️ Duration: ~1h | 🛠️ Skill by [Yoan Thirion](https://github.com/ythirion/)

---

## 📋 1. Documentation

Le README est complet et bien structuré : il présente clairement l'objectif du projet, la stack technique, les étapes d'installation, les fonctionnalités principales et l'architecture de sécurité. Un fichier `.env.local.example` est fourni avec toutes les variables nécessaires. Le schéma SQL est présent dans `supabase/schema.sql`. En revanche, il n'y a aucune ADR, aucun guide de contribution et pas de documentation sur le déploiement du cron job côté Vercel.

- ✅ README clair, purpose immédiatement compréhensible
- ✅ `.env.local.example` fourni avec toutes les variables de configuration
- ✅ Schéma SQL documenté (`supabase/schema.sql`)
- 🟠 Aucune ADR (Architecture Decision Records) — les choix techniques ne sont pas tracés
- 🟠 Le cron Vercel (`/api/cron/check-expirations`) n'est pas documenté dans le README (configuration Vercel requise non mentionnée)
- 🟠 Pas de guide de contribution ni de conventions de commit documentées

---

## 🔄 2. CI/CD Pipelines

Aucun pipeline CI/CD n'est configuré dans le dépôt. Pas de dossier `.github/workflows/`, pas de `Jenkinsfile`, pas de `.gitlab-ci.yml`. Le déploiement repose entièrement sur l'intégration Vercel (deploy automatique sur push), mais sans étapes de validation qualité intermédiaires.

- 🔴 Aucun pipeline CI/CD — aucune gate automatique avant déploiement
- 🔴 Aucun test automatisé lancé sur les pull requests
- 🔴 Aucun seuil de couverture ou de qualité de code
- 🟠 Le lint est disponible via `npm run lint` mais n'est pas exécuté automatiquement en CI

---

## 📜 3. Git History

Le dépôt compte **47 commits** répartis sur une période de **~3 mois** (25 février 2026 → 14 mai 2026). Il y a **un seul contributeur** : MatthieuLUIGGI. La qualité des messages de commit est généralement bonne avec un usage cohérent du format conventionnel (`feat:`, `fix:`, `style:`, `perf:`), bien que certains commits soient moins informatifs ("Correction d'erreurs dans la console navigateur", "Ajout message bulle robot"). Les fichiers les plus souvent modifiés sont `lib/hooks/useNotifications.ts` (3 fois) et `components/landing/Hero.tsx` (3 fois), ce qui est faible en termes de hotspot.

- 🔴 Contributeur unique sur l'ensemble du projet — risque de bus factor = 1
- 🟠 Quelques messages de commit sans contexte suffisant ("Correction d'erreurs", "Petite modification")
- ✅ Bonne discipline générale avec le format conventionnel (`feat`, `fix`, `style`, `perf`)
- ✅ Activité récente (dernier commit en mai 2026)

---

## 🔨 4. Build & Compilation

Le projet est basé sur Next.js 14 avec App Router. L'installation standard (`npm install` + `.env.local` rempli) est documentée. Le build nécessite un projet Supabase configuré avec les scripts SQL exécutés manuellement. Aucun Docker Compose ni dev container n'est fourni pour faciliter l'onboarding. Le `next.config.mjs` est vide — aucune configuration spécifique.

- 🟠 Pas de Docker Compose ou dev container — la DB Supabase est une dépendance externe obligatoire non reproductible localement
- 🟠 Les scripts SQL (`schema.sql`, `new_query.sql`) doivent être exécutés manuellement dans l'éditeur Supabase — processus non automatisé
- 🟠 La variable `SUPABASE_SERVICE_ROLE_KEY` est requise pour le cron mais peu expliquée dans la doc
- ✅ `npm install && npm run dev` devrait fonctionner une fois les variables d'environnement renseignées

---

## ⚠️ 5. Compilation Warnings

Sans accès à un build live, l'analyse se base sur l'inspection du code source. Plusieurs patterns susceptibles de générer des warnings ont été identifiés : utilisation de `any` en TypeScript, assertion non-null (`!`) sur des variables d'environnement, cookie options avec manipulation inhabituelle dans `lib/supabase/server.ts`.

- 🟠 Usage fréquent de `as any` et `any` dans les types (ex: `supabase/badges-vigik/page.tsx`, `dashboard/consultations/page.tsx`)
- 🟠 Assertions non-null `!` sur `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` — plante en runtime si la variable est absente
- 🟠 `react-quill` v2 est une bibliothèque qui n'est plus maintenue activement et génère des warnings React dans Next.js 14 (composant legacy)
- ✅ Usage de `dynamic()` pour `ReactQuill` avec `ssr: false` — bonne pratique pour éviter les erreurs d'hydratation

---

## 🗂️ 6. Code Structure

Le projet suit la structure Next.js App Router avec des groupes de routes `(app)`, `(auth)`, et `admin`. La séparation est fonctionnelle : les pages résidents sont sous `(app)`, l'authentification sous `(auth)`, et la console admin sous `admin/board`. Les composants sont organisés par domaine (`landing`, `layout`, `board`, `dashboard`, `ui`). La logique métier est partiellement dans des hooks (`lib/hooks/`) et des utilitaires (`lib/`). Cependant, la frontière entre présentation et logique est floue — la logique d'accès Supabase est directement dans les composants page plutôt que dans des services dédiés.

- 🟠 Pas de couche service/repository — les appels Supabase sont faits directement dans les composants (`createClient()` appelé dans les `useEffect` des pages)
- 🟠 Le contrôle d'accès admin est géré **côté client** via `useEffect` + `redirect()` — la vérification de rôle arrive après le premier rendu, ce qui expose brièvement le contenu admin
- 🟠 `lib/validations.ts` contient `announceSchema` qui ne correspond à aucune fonctionnalité existante dans l'app (code mort)
- 🟠 `fix.js` à la racine du projet — script de maintenance one-shot qui n'a pas sa place dans le dépôt
- ✅ Séparation claire des routes publiques/privées dans le middleware
- ✅ Composants UI basés sur shadcn/ui — cohérence visuelle garantie

---

## 📦 7. Dependencies

Le projet compte **30 dépendances de production** et **7 devDependencies**. La stack est moderne et bien choisie dans l'ensemble. Quelques alertes notables :

| Dépendance | Version | Statut |
|---|---|---|
| `react-quill` | ^2.0.0 | 🔴 Dernier release en 2022, non maintenu, dépendance legacy |
| `@splinetool/react-spline` | ^4.1.0 | 🟠 Service externe propriétaire, dépendance à une CDN tierce |
| `next` | 14.2.15 | 🟠 Next.js 15 est disponible — une version majeure de retard |
| `framer-motion` | ^12.34.3 | ✅ À jour |
| `@supabase/supabase-js` | ^2.97.0 | ✅ À jour |
| `zod` | ^4.3.6 | ✅ À jour |

- 🔴 `react-quill` v2 est abandonné — aucun support pour React 18/19, vulnérabilités potentielles non corrigées
- 🟠 `@splinetool/react-spline` télécharge une scène 3D depuis une CDN externe (`prod.spline.design`) — dépendance à un service tiers payant
- 🟠 `next` en version 14 alors que Next.js 15 est disponible (gap d'une version majeure)
- 🟠 `@dnd-kit` (3 packages) utilisé uniquement pour la réorganisation des documents AG/CS — overhead potentiel

---

## 🕐 8. Dependency Freshness

Estimation du drift par catégorie :

| Catégorie | Packages | Drift estimé |
|---|---|---|
| Framework | `next@14` vs `next@15` | ~1 an |
| UI | Radix UI, shadcn | Récents, ✅ |
| Auth/DB | Supabase SDKs | Récents, ✅ |
| Rich text | `react-quill@2.0.0` | ~3 ans |
| Animations | `framer-motion@12` | ✅ |

- 🔴 `react-quill` v2.0.0 : dernier release en août 2022, soit ~4 libyears de retard
- 🟠 `next@14` vs `next@15` : ~1 libyear de retard sur le framework principal
- ✅ La majorité des dépendances (Radix UI, Supabase, Tailwind, Zod) sont récentes et actives

**Total drift estimé : ~5-6 libyears**, concentré sur `react-quill` et `next`.

---

## 📊 9. Quality Metrics

Aucun test n'est présent dans le projet. Pas de dossier `__tests__`, `test`, `spec`, ni de configuration Jest, Vitest, ou Playwright. La couverture de code est de facto 0%.

| Métrique | Valeur | Seuil sain |
|---|---|---|
| Code coverage | 0% | > 80% |
| Tests unitaires | 0 | — |
| Tests e2e | 0 | — |
| Mutation score | N/A (0 tests) | > 75% |
| ESLint configuré | Oui (`next lint`) | — |
| TypeScript strict | Non configuré explicitement | — |

- 🔴 Aucun test — zéro couverture, aucune régression détectable automatiquement
- 🔴 Aucune configuration TypeScript strict (`strictNullChecks`, etc.) explicitement activée
- 🟠 ESLint est configuré mais uniquement via `eslint-config-next` — pas de règles de qualité supplémentaires
- 🟠 Pas de linter de CSS (Stylelint) ni de vérification d'accessibilité automatique (axe-linter)

---

## 🔥 10. Hotspots

Analyse croisée fréquence de modifications × complexité perçue :

| Fichier | Complexité | Commits (total) | Auteur principal | Risque |
|---|---|---|---|---|
| `components/landing/Hero.tsx` | Moyenne | 3 | MatthieuLUIGGI (100%) | 🟠 |
| `lib/hooks/useNotifications.ts` | Faible-Moyenne | 3 | MatthieuLUIGGI (100%) | 🟠 |
| `app/api/cron/check-expirations/route.ts` | Faible | 2 | MatthieuLUIGGI (100%) | 🔴 (sécurité) |
| `app/(app)/accueil/page.tsx` | Faible | 2 | MatthieuLUIGGI (100%) | ✅ |
| `app/(app)/dashboard/actualites/ActualiteForm.tsx` | Haute | 1 | MatthieuLUIGGI (100%) | 🟠 |

- 🔴 **Bus factor global = 1** — 100% des fichiers ont un unique auteur, MatthieuLUIGGI
- 🔴 `ActualiteForm.tsx` (321 lignes) : composant le plus complexe, mélange gestion d'état, logique de compression d'images, appels Supabase et UI — non testé
- 🟠 `Hero.tsx` : chargement de scène Spline + appel Supabase au montage — point de dépendance à deux services externes
- 🟠 `check-expirations/route.ts` : endpoint critique utilisant la clé service role sans authentification (voir §13)

---

## ♿ 11. Accessibility

Projet en **français** → référentiel **RGAA 4.1** applicable. Application web avec UI complète.

La base d'accessibilité est correcte grâce à l'utilisation de shadcn/ui (composants Radix-based) qui gère nativement la navigation au clavier, les rôles ARIA et les attributs sémantiques. Le `lang="fr"` est présent sur l'élément `<html>`. Les icônes Lucide dans la sidebar ont `aria-hidden="true"`.

Points d'attention identifiés :

- ✅ `<html lang="fr">` présent — RGAA 8.3/8.4 respecté
- ✅ Icônes décoratives avec `aria-hidden="true"` dans la Sidebar
- ✅ Composants shadcn/ui (Radix) : navigation clavier, rôles ARIA natifs sur Dialog, Select, Checkbox
- ✅ Labels `<Label>` associés aux champs de formulaire (login, register) — RGAA 11.1
- 🟠 Pas de lien d'évitement ("skip to main content") — RGAA 12.7 / WCAG 2.4.1
- 🟠 La `<nav>` de la Sidebar n'a pas d'attribut `aria-label` pour distinguer les navigations multiples
- 🟠 `ActualiteForm.tsx` : les `<label>` sont des éléments bruts (non `<Label>` shadcn) sur les champs de médias — vérifier l'association `for`/`id`
- 🟠 Le composant Spline 3D (`Hero.tsx`) n'a pas d'alternative textuelle ni d'`aria-label` — contenu non accessible aux lecteurs d'écran

---

## 🌱 12. Eco-design

Projet en **français** → référentiel **RGESN 2024** applicable.

- 🔴 **Images stockées en base64 dans PostgreSQL** — les images des actualités (et photos syndic) sont compressées côté client puis stockées en base64 dans la table `actualites.image_url`. Cela génère des payloads SQL énormes, ralentit les requêtes et contourne toute logique de CDN/cache. Supabase Storage ou un service dédié (Cloudflare R2, S3) devrait être utilisé — **RGESN BP 2.6**
- 🔴 **Scène Spline 3D** (`Hero.tsx`) : chargement d'une scène 3D depuis `prod.spline.design` (runtime WebGL lourd, >5MB potentiel) sur la page d'accueil publique sans lazy-loading conditionnel, sans fallback image, et sans option utilisateur pour désactiver — **RGESN BP 2.6 / BP 1.1**
- 🔴 **Pas de pagination** sur les listes d'actualités et de documents (`supabase.from('actualites').select(...)` sans `.range()` ni `.limit()`) — unbounded response possible à mesure que les données croissent — **RGESN BP 6.1**
- 🟠 **Aucun header de cache HTTP** configuré — le `next.config.mjs` est vide, pas de `Cache-Control` sur les routes d'API ni les assets statiques
- 🟠 **PDFs et Word/Excel stockés en base64** également dans la colonne `pdf_url` — même problème que les images mais avec des fichiers potentiellement bien plus lourds
- 🟠 `@splinetool/runtime` en dépendance de production — runtime WebGL importé même si l'utilisateur ne visite pas la landing page
- ✅ Compression côté client des images avant upload (`compressImage.ts` — resize 1200×1200, qualité 85%) — intention éco-design présente, mais la cible (base64 en DB) reste problématique
- ✅ `dynamic()` avec `ssr: false` pour ReactQuill — évite un bundle côté serveur inutile

---

## 🎯 13. Summary

### 🔴 Top 3 risques

1. **Endpoint cron non authentifié** (`app/api/cron/check-expirations/route.ts`, ligne 9-11) : Le bloc d'autorisation par token est commenté. N'importe quel visiteur anonyme peut déclencher la suppression de notifications et l'écriture de logs avec la clé service role. Il faut décommenter la vérification du `CRON_SECRET` et l'ajouter aux variables d'environnement.

2. **Contrôle d'accès admin côté client uniquement** (`app/(app)/dashboard/*/page.tsx`) : La vérification `user.role !== 'ag'` est faite dans un `useEffect` après rendu, pas dans un Server Component ou dans le middleware. Un utilisateur mal intentionné peut voir momentanément le contenu admin et potentiellement interagir avec l'UI avant la redirection. La vérification doit être montée au niveau du middleware ou d'un Server Component.

3. **Stockage des médias en base64 dans PostgreSQL** : Les images et fichiers PDF/Word/Excel des actualités sont stockés en base64 directement dans la base de données. Cela dégrade les performances des requêtes, exclut tout mécanisme de CDN et de cache, et fait grossir la DB de façon non contrôlée. Migrer vers Supabase Storage est une correction architecturale prioritaire.

### ❓ Top 3 questions à valider avec l'équipe

1. **Le mécanisme `admin_board_password`** : La table `admin_board_password` stocke un mot de passe SHA-256 partagé pour accéder au board admin. Pourquoi ne pas utiliser les rôles Supabase Auth directement ? Ce mécanisme custom contourne les protections natives et nécessite une gestion manuelle.

2. **La table `conseil_password`** (dans le schéma) : Il semble y avoir une protection par mot de passe côté page pour certaines sections. Ce pattern se confirme-t-il en production ? Si oui, c'est un second mécanisme d'auth custom à risque.

3. **Le mode démo** (`DEMO_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL`) : Ce flag est actif en développement sans Supabase. Est-il désactivé en production ? Le code contient `if (DEMO_MODE) { router.push("/accueil"); return; }` dans le login, ce qui bypasserait toute authentification si la variable d'env était absente en prod.

### 🗺️ Prochaines actions recommandées

- **Immédiat :**
  - Décommenter la vérification du `CRON_SECRET` dans `app/api/cron/check-expirations/route.ts`
  - Ajouter la vérification de rôle dans le middleware Next.js pour les routes `/dashboard/*` (côté serveur)
  - Remplacer `react-quill` par une alternative maintenue (ex: `@tiptap/react` ou `react-markdown` avec un éditeur)

- **Court terme :**
  - Migrer le stockage des images et fichiers vers Supabase Storage — supprimer les colonnes base64 de la table `actualites`
  - Ajouter la pagination sur toutes les requêtes Supabase de type liste (`.range(0, 19)` au minimum)
  - Mettre en place un CI minimal (GitHub Actions) : lint + type-check sur chaque PR
  - Supprimer `fix.js` de la racine du projet

- **Moyen terme :**
  - Écrire des tests e2e (Playwright) sur les parcours critiques : connexion, vote consultation, création d'actualité
  - Mettre à jour `next` vers la v15 (une version majeure de retard)
  - Ajouter un lien d'évitement au contenu principal pour la conformité RGAA
  - Envisager une alternative légère au composant Spline 3D (image statique optimisée WebP) pour la page publique

---

## 📂 Detailed Analysis

| Document | Description |
|----------|-------------|
| [🧹 Code Quality](details/CodeQuality.md) | Rapport de code smells avec note et recommandations de refactoring |
