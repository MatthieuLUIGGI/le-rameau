# Le Rameau - Application de gestion de copropriété

Le Rameau regroupe les actualités, les documents et les consultations d'une résidence dans un espace privé. L'application utilise Next.js 14, React 18, TypeScript, Tailwind CSS, Zod et Supabase. La page publique présente la résidence avec une photographie ; l'ancien robot 3D n'est plus affiché.

## Prérequis

- Node.js 22, version 22.12 minimum, ou Node.js 24, avec npm. Les dépendances de test installées ne sont pas compatibles avec Node.js 18.
- Git et un accès au dépôt GitHub.
- La configuration du projet Supabase existant pour utiliser les comptes et les données.
- k6 dans le `PATH`, uniquement pour les scénarios de charge et les vérifications du script k6.

## Installation sur un nouveau PC

Depuis PowerShell :

```powershell
git clone https://github.com/MatthieuLUIGGI/le-rameau.git
cd le-rameau
git switch dev
npm ci
```

`npm ci` installe les versions du `package-lock.json`. Il ne faut pas recopier `node_modules` depuis une autre machine.

### Configuration de l'application

Si aucun fichier `.env` ou `.env.local` n'existe, créer le fichier local depuis le modèle :

```powershell
if (-not (Test-Path .env) -and -not (Test-Path .env.local)) {
    Copy-Item .env.local.example .env.local
}
```

Remplacer les valeurs d'exemple par celles du projet Supabase utilisé :

| Variable | Utilisation |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique utilisée par le client, avec les politiques RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur pour les opérations d'administration qui en ont besoin. Ne jamais la préfixer par `NEXT_PUBLIC_`. |
| `CRON_SECRET` | Secret serveur pour protéger la tâche planifiée |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` pour le développement local |
| `NEXT_PUBLIC_APP_NAME` | Nom affiché de l'application |

Un fichier `.env` déjà fonctionnel peut être conservé. Ne pas ajouter par-dessus un `.env.local` contenant des valeurs fictives, car ses valeurs peuvent remplacer celles du `.env`. Après modification de la configuration, redémarrer le serveur Next.js.

Les fichiers `.env` et `.env.local` sont privés et ignorés par Git. Le modèle `.env.local.example` ne contient pas de véritables identifiants. Les variables configurées dans Vercel ne sont pas téléchargées automatiquement lors d'un clone.

Un nouveau clone ne nécessite pas une nouvelle base si le même projet Supabase est utilisé. Ne pas réexécuter les scripts SQL sur la base existante pour installer le code sur un autre PC. `supabase/schema.sql` est un schéma de référence, marqué comme non directement exécutable ; ce n'est pas une migration automatique. Pour une nouvelle base, la création des tables, des règles RLS, des comptes et du stockage doit être préparée séparément.

### Lancement local

```powershell
npm run dev
```

L'application est accessible sur `http://localhost:3000`. Les services Supabase restent distants : une modification de données depuis le site local peut donc affecter la base configurée.

## Travailler entre le PC fixe et le portable

Les deux machines contiennent des clones du même dépôt. Le code source n'est pas attaché à un PC en particulier : les commits publiés sur GitHub constituent le point de synchronisation.

Sur la machine où le travail a été publié, pousser les commits de `dev`. Sur l'autre machine, commencer par vérifier son état :

```powershell
git status
```

Si cette machine contient des modifications ou des commits non publiés, les sauvegarder et les examiner avant de changer de branche ou de récupérer le travail distant. Ne pas utiliser de commande de réinitialisation pour les effacer.

Lorsque le dossier de travail est propre et la branche locale compatible avec l'historique distant :

```powershell
git switch dev
git pull --ff-only origin dev
npm ci
```

Si Git refuse le changement de branche ou le `pull --ff-only`, s'arrêter pour examiner les différences. Ne pas forcer et ne pas écraser le dossier avec une archive ZIP.

Transférer seulement les fichiers privés nécessaires, par un moyen personnel sécurisé : `.env` ou `.env.local` pour l'application, et `tests/load/config.local.json` pour k6 si ce fichier existe déjà sur l'autre machine. Conserver un nom et une configuration cohérents, sans multiplier les fichiers d'environnement. Vérifier ensuite `git status` avant tout commit.

Une archive ZIP privée peut servir de sauvegarde, mais elle ne remplace pas cette synchronisation. Ne pas l'extraire par-dessus un clone existant, ne pas y inclure les fichiers secrets si elle doit être partagée, et ne pas recopier les dossiers `.git`, `node_modules`, `.next` ou `coverage` pour mettre à jour l'autre clone.

## Branches et déploiements Vercel

| Branche | Rôle |
| --- | --- |
| `dev` | Développement et intégration des corrections |
| `preprod` | Version à vérifier sur le déploiement Preview Vercel |
| `prod` | Version validée suivie par l'environnement Production Vercel |
| `main` | Branche historique conservée dans le dépôt |

Le parcours de validation est `dev`, puis `preprod`, puis `prod`. Chaque intégration peut être relue dans une pull request. Une branche Git ne représente pas une base de données distincte et un changement de branche local ne choisit pas automatiquement une autre base Supabase.

La préproduction utilise l'adresse stable :

https://le-rameau-git-preprod-matthieuluiggis-projects.vercel.app

Sur Vercel, la branche de production doit rester `prod`, les branches de développement utilisant des déploiements Preview. Les variables Vercel sont configurées dans le tableau de bord pour chaque environnement concerné. La base Supabase est actuellement partagée entre les déploiements : la préproduction n'est donc pas complètement isolée des données de l'autre déploiement.

## Vérifications applicatives

```powershell
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
```

Les tests applicatifs se trouvent dans `__tests__`. Ils vérifient notamment les formulaires, les utilitaires, la journalisation et le service de consultations. Le contrôle de la contrainte SQL vérifie sa présence dans le fichier de référence ; il ne lance pas une véritable base PostgreSQL.

La couverture est générée dans `coverage`, ignoré par Git. Le build nécessite la configuration publique Supabase ; les opérations d'administration et les tâches planifiées ont aussi besoin des secrets serveur pour fonctionner à l'exécution.

La CI GitHub Actions contrôle les pushes et les pull requests sur `main`, `dev`, `preprod` et `prod`. Elle installe les dépendances avec `npm ci`, puis lance le lint, la vérification TypeScript, les tests unitaires et le build. Les secrets publics nécessaires au build doivent être renseignés dans les secrets GitHub Actions. Cette CI ne déclenche pas de test de charge contre le site déployé.

## Tests de montée en charge k6

Les fichiers k6 ne remplacent pas la configuration Next.js. Après un clone, créer séparément le fichier local, uniquement s'il n'existe pas :

```powershell
if (-not (Test-Path tests/load/config.local.json)) {
    Copy-Item tests/load/config.example.json tests/load/config.local.json
}
```

Renseigner Supabase, les identifiants d'un compte de test et, si nécessaire, le secret de contournement de la protection Vercel. Ne jamais renseigner la clé `service_role` dans cette configuration. Elle reste ignorée par Git.

Commencer par un parcours court sur la préproduction :

```powershell
.\tests\load\run-preprod.ps1 -Profile smoke
.\tests\load\run-preprod.ps1 -Profile demo
.\tests\load\run-preprod.ps1 -Profile load
```

Le profil `load` monte jusqu'à 30 clients virtuels. Le scénario consulte des données existantes sans créer de vote ou de contenu. Pour vérifier le script contre un serveur factice local, sans lancer de charge sur Vercel :

```powershell
node --test tests/load/preprod.test.mjs
```

Le guide complet est dans [tests/load/README.md](tests/load/README.md). Six rapports historiques HTML/JSON cités dans le livret sont versionnés dans `tests/load/results`. Les nouveaux rapports restent ignorés par défaut pour éviter d'ajouter tous les essais au dépôt.

## Fonctionnalités et documentation

- Page publique de présentation de la résidence, liens légaux et gestion des préférences de cookies.
- Espace résident avec actualités, informations du syndic, badges Vigik et documents.
- Consultations avec une réponse par logement et par consultation.
- Administration des contenus avec des droits distincts selon le rôle.

Supabase fournit l'authentification, PostgreSQL et le stockage. Les contrôles d'accès de l'interface ne remplacent pas les contrôles serveur et les politiques RLS.

Le dossier source est [livret f2i.md](livret%20f2i.md), avec ses images dans `docs/schemas`. Les fichiers de travail Gantt, les scripts de génération de PDF, les exports PDF/HTML du livret, les outils Codex et les fichiers temporaires ne sont pas inclus dans cette sélection versionnée. Les éventuelles références à ces fichiers dans le livret ne fournissent pas leurs sources dans un nouveau clone.
