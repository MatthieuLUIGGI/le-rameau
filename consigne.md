# Consignes — À ne pas inclure dans le livret jury

Ce fichier contient les instructions opérationnelles, les éléments à compléter avant la soutenance et les explications des choix techniques. **Il ne doit pas être présenté au jury** — uniquement le livret `Livret candidat RNCP Concepteur Développeur Web Full Stack.md`.

---

## Actions à faire avant la soutenance

### 1. Créer les buckets Supabase Storage

Aller dans le **dashboard Supabase → SQL Editor** et exécuter le fichier :
```
supabase/storage-buckets.sql
```

Puis vérifier dans **Storage** que les deux buckets existent :
- `actualites-images` (public)
- `actualites-fichiers` (public)

### 2. Ajouter `CRON_SECRET` dans Vercel

**2a. Générer un secret aléatoire :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copie la valeur affichée.

**2b. L'ajouter dans Vercel :**
1. [vercel.com](https://vercel.com) → ton projet → **Settings** → **Environment Variables**
2. **Add New** :
   - Key : `CRON_SECRET`
   - Value : colle le secret généré
   - Environment : coche `Production` + `Preview` + `Development`
3. Clique **Save**

**2c. L'ajouter dans `.env.local` (pour les tests locaux) :**
```
CRON_SECRET=<la valeur générée>
```

**2d. Vérifier la configuration cron :**
Le fichier `vercel.json` à la racine du projet définit la planification :
```json
{
  "crons": [{ "path": "/api/cron/check-expirations", "schedule": "0 3 * * *" }]
}
```
Quand `CRON_SECRET` est défini dans les variables Vercel, Vercel envoie **automatiquement** le header `Authorization: Bearer <CRON_SECRET>` — aucune configuration supplémentaire requise.

### 3. Migrer les données existantes vers Supabase Storage

Si des actualités ont des images/PDFs stockés en base64 dans la base de données :

```bash
# Installer ts-node si besoin
npm install -D ts-node

# Lancer la migration
npx ts-node --project tsconfig.json scripts/migrate-to-storage.ts
```

> Le script lit automatiquement `.env.local` pour les credentials.

### 4. Configurer les secrets GitHub Actions

Le CI (`npm run build`) a besoin des variables Supabase pour compiler. Sans elles, le build échoue.

**Comment ajouter les secrets :**
1. [github.com](https://github.com) → ton dépôt → **Settings**
2. Menu gauche → **Security** → **Secrets and variables** → **Actions**
3. Clique **New repository secret** et ajoute ces 2 secrets :

| Name | Value (trouvable dans `.env.local` ou Supabase → Settings → API) |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxxxxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clé `anon` (longue chaîne JWT) |

**Vérification :** Après un push sur `main`, l'onglet **Actions** du repo doit afficher :
```
✅ Lint (ESLint)
✅ Vérification des types (TypeScript)
✅ Tests unitaires (Vitest)
✅ Build de validation (Next.js)
```

### 5. Compléter le score EcoIndex dans le livret

Lancer un test sur [ecoindex.fr](https://www.ecoindex.fr) avec l'URL `https://le-rameau.vercel.app` et remplacer le `🔄` restant dans le tableau des indicateurs de performance (section C27-C28 du livret).

---

## Modifications code réalisées (récapitulatif pour la soutenance)

| Chantier | Fichiers modifiés | Impact |
|---|---|---|
| **Sécurité cron** | `app/api/cron/check-expirations/route.ts` | CRON_SECRET activé |
| **Middleware** | `middleware.ts` | Routes API publiques en liste explicite |
| **TypeScript** | `lib/logger.ts`, `lib/validations.ts`, `lib/types/roles.ts` | Suppression de tous les `any` |
| **Tests Vitest** | `__tests__/*.test.ts`, `vitest.config.ts` | 27 tests unitaires |
| **CI/CD** | `.github/workflows/ci.yml` | Lint + typecheck + tests + build auto |
| **Accessibilité** | `NotificationBell.tsx`, `Sidebar.tsx`, `accueil/page.tsx` | 3 issues Lighthouse corrigées |
| **Storage** | `ActualiteForm.tsx`, `supabase/storage-buckets.sql` | Images/PDFs vers Supabase Storage |
| **Service layer** | `lib/services/actualitesService.ts`, `consultationsService.ts` | Découplage Supabase |
| **Nettoyage** | `fix.js` (supprimé), `announceSchema` (supprimé) | Code mort retiré |

---

## Pourquoi ces choix ? (arguments pour la soutenance)

**Couche service plutôt que Repository pattern complet :**
Projet solo sans injection de dépendances nécessaire — un fichier service par domaine est suffisant pour démontrer la compétence de découplage tout en restant pragmatique.

**Vitest plutôt que Jest :**
Vitest est natif TypeScript/ESM, s'intègre sans configuration avec le projet Next.js (même setup Vite), et est significativement plus rapide sur les suites de tests unitaires.

**Storage Supabase plutôt que Cloudflare R2/AWS S3 :**
Intégration native avec Supabase Auth (RLS sur les buckets), même SDK, pas de compte externe supplémentaire, et le projet est déjà hébergé sur Supabase.

**GitHub Actions plutôt que GitLab CI / Jenkins :**
Le dépôt est sur GitHub, GitHub Actions est gratuit et s'intègre directement sans infrastructure supplémentaire.

---

## Réponses aux questions du professeur

**"Mettre en place la partie pipeline CI"**
→ Fait : `.github/workflows/ci.yml` avec lint + typecheck + vitest + build.

**"Définir la stratégie de tests et mettre en place des tests automatisés"**
→ Fait : 27 tests Vitest couvrant `getInitials`, `sanitizeData` (7 assertions sur la logique de troncature), et tous les cas de validation Zod (loginSchema + registerSchema). Exécutés automatiquement dans le CI.

**"Supprimer l'usage des `any` et utiliser des types"**
→ Fait : `lib/logger.ts` (old_data/new_data typés en `Record<string, unknown>`), `lib/validations.ts` (as any supprimé), `app/api/cron/route.ts` (catch typé en unknown). Enum `UserRole` créée dans `lib/types/roles.ts`.

**"Revoir l'architecture pour découpler l'usage de Supabase"**
→ Fait : `lib/services/actualitesService.ts` et `consultationsService.ts` créés. `dashboard/actualites/page.tsx` branché sur le service. Les autres pages utilisent encore directement `createClient()` — migration progressive documentée.

**"Mettre en place les recommandations en termes d'accessibilité / éco-conception"**
→ Accessibilité : 3 issues Lighthouse corrigées (button-name, image-alt, color-contrast). Éco-conception : images et PDFs migrés de base64 en DB vers Supabase Storage (CDN + cache HTTP), pagination `.range(0, 49)` ajoutée dans les services.
