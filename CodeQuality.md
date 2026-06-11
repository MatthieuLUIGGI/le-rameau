# 🧹 Code Quality — le-rameau
> Overall grade: **C+**

← [Back to Report](../Report.md)

---

## 🔴 Mutable Data / Architecture — Stockage de médias en base64 dans la DB

`app/(app)/dashboard/actualites/ActualiteForm.tsx` — `handleImageFile()` + `handleSave()`  
`lib/compressImage.ts`

Les images (et fichiers PDF/Word) sont lus côté client, convertis en base64, stockés dans un state React puis persistés directement dans les colonnes `image_url` et `pdf_url` de la table `actualites` en PostgreSQL. Une image compressée à 85% en JPG de 1200×1200 peut peser 200-400 Ko en binaire, soit ~270-530 Ko en base64. Ces données transitent via l'API Supabase à chaque lecture de la liste des actualités.

→ **Refactoring :** Utiliser Supabase Storage (ou tout bucket S3-compatible). `handleImageFile()` doit uploader le fichier et stocker uniquement l'URL retournée. Les colonnes `image_url` et `pdf_url` deviennent des `text` (URL), ce qu'elles sont déjà conceptuellement.

---

## 🔴 Feature Envy / Contrôle d'accès dispersé — Vérification de rôle dans les composants clients

`app/(app)/dashboard/actualites/page.tsx:44-47`  
`app/(app)/dashboard/consultations/page.tsx:44-48`  
`app/(app)/dashboard/ag/page.tsx` (et tous les autres sous `/dashboard/`)

La logique d'autorisation (`user.role !== 'ag'`) est répétée dans un `useEffect` de chaque page du dashboard. Cette vérification est exécutée côté client après le premier rendu, ce qui signifie que le composant est monté, son UI est rendue, et seulement alors la redirection se déclenche. C'est un pattern d'autorisation fragile qui se duplique dans chaque nouvelle page admin.

```tsx
// Pattern répété dans chaque page dashboard
useEffect(() => {
    if (!userLoading && user && user.role !== 'ag') {
        redirect("/accueil");  // trop tard — composant déjà rendu
    }
}, [user, userLoading]);
```

→ **Refactoring :** Centraliser la vérification dans `middleware.ts` en ajoutant une condition sur `/dashboard/*`, ou créer un Server Component wrapper `RequireRole` qui lit la session côté serveur avant de rendre le contenu.

---

## 🔴 Sécurité — Endpoint cron sans authentification

`app/api/cron/check-expirations/route.ts:8-12`

Le bloc d'authentification par `CRON_SECRET` est commenté. N'importe quel client HTTP peut appeler `GET /api/cron/check-expirations` et déclencher des suppressions en base avec la clé service role.

```ts
// Vérification éventuelle d'un token d'autorisation
// const authHeader = request.headers.get('authorization');
// if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// }
```

→ **Refactoring :** Décommenter immédiatement ce bloc et ajouter `CRON_SECRET` dans les variables d'environnement Vercel. C'est une route avec des effets de bord (suppressions, écritures) exposée publiquement.

---

## 🔴 Global Data / Middleware trop permissif — Toutes les routes `/api/` sont publiques

`middleware.ts:26`

La condition `path.startsWith('/api/')` marque **toutes** les routes d'API comme publiques, bypassant la vérification d'authentification du middleware pour n'importe quel endpoint futur sous `/api/`.

```ts
const isPublic = path === '/' || path === '/login' || ... || path.startsWith('/api/');
```

Seul le cron aurait dû être listé (et avec auth propre). Si un développeur ajoute demain une route `/api/user/data` sans protection interne, elle sera exposée sans auth.

→ **Refactoring :** Remplacer `path.startsWith('/api/')` par une liste explicite des routes publiques : `/api/cron/check-expirations`. Les routes protégées doivent vérifier la session elles-mêmes via `createServerClient`.

---

## 🟠 Large Class — `ActualiteForm.tsx` (321 lignes)

`app/(app)/dashboard/actualites/ActualiteForm.tsx`

Ce composant gère simultanément : l'état du formulaire (7 champs), la compression d'image, la preview d'image, le calcul de taille, le téléchargement de fichiers PDF, la logique de création/mise à jour Supabase, les logs d'actions, la création de notifications et le rendu JSX complet. C'est un exemple classique de "God Component".

→ **Refactoring :** Extraire : (1) `useActualiteForm(initialData)` — hook gérant l'état et la soumission, (2) `ImageUploader` — composant de drag & drop + compression, (3) `FileUploader` — composant fichier. Le composant racine devient un orchestrateur de ~80 lignes.

---

## 🟠 Duplicated Code — Pattern fetch/load/redirect répété dans les pages admin

`app/(app)/dashboard/actualites/page.tsx`  
`app/(app)/dashboard/ag/page.tsx`  
`app/(app)/dashboard/consultations/page.tsx`  
`app/(app)/dashboard/badges-vigik/page.tsx`  
(et tous les autres sous `/dashboard/`)

Chaque page admin implémente le même squelette :
```tsx
const { user, isLoading: userLoading } = useUser();
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
    if (!userLoading && user && user.role !== 'ag') redirect("/accueil");
}, [user, userLoading]);
useEffect(() => { fetchData(); }, []);
if (userLoading || isLoading) return <Loader2 ... />;
```

→ **Refactoring :** Créer un hook `useAdminPage()` qui encapsule la vérification de rôle + l'état de chargement. Ou mieux, voir la recommandation côté middleware dans le smell précédent.

---

## 🟠 Primitive Obsession — Rôles utilisateur comme strings non typés

`middleware.ts:37-40`  
`components/layout/Sidebar.tsx:170`  
`app/(app)/dashboard/actualites/page.tsx:44`

Les rôles (`'ag'`, `'admin'`, `'super_admin'`, `'membre'`) sont des strings littéraux éparpillés dans le code. Le type `user_role` existe dans Supabase (`database.types.ts`) mais n'est pas utilisé systématiquement pour les comparaisons.

→ **Refactoring :** Créer une enum ou un objet const `UserRole` et l'utiliser partout. Cela centralise les valeurs et permet au compilateur TypeScript de signaler les fautes de frappe.

```ts
export const UserRole = { MEMBRE: 'membre', AG: 'ag', ADMIN: 'admin', SUPER_ADMIN: 'super_admin' } as const;
```

---

## 🟠 Custom Auth Mechanism — Mot de passe board stocké en SHA-256 dans la DB

`app/admin/board/password/page.tsx`  
`supabase/schema.sql` — table `admin_board_password`  
`supabase/schema.sql` — table `conseil_password`

Deux mécanismes d'authentification custom coexistent avec Supabase Auth : un mot de passe partagé SHA-256 pour le board admin, et des mots de passe par page pour le conseil syndical. SHA-256 sans sel est vulnérable aux rainbow tables. De plus, ce système bypass complètement la gestion des sessions, l'audit trail et la révocation des accès natifs de Supabase.

→ **Refactoring :** Utiliser les rôles Supabase Auth nativement. Le board admin devrait être accessible via le rôle `admin`/`super_admin` géré dans `profiles.role`. Les mots de passe partagés ne sont pas une solution d'authentification robuste.

---

## 🟠 Dead Code — `announceSchema` et données démo orphelines

`lib/validations.ts:29-34`

`announceSchema` définit des champs (`categorie`, `is_important`) qui n'existent plus dans la table `actualites` du schéma actuel — ce schéma correspond à une ancienne version de l'entité. Il n'est référencé nulle part dans le code actif.

`lib/demo-data.ts` contient des types `Canal`, `Message`, `Contact`, `WeatherDay` et leurs données associées. Ces fonctionnalités (messagerie, météo, contacts) ne semblent pas exister dans l'application actuelle.

→ **Refactoring :** Supprimer `announceSchema` de `validations.ts`. Auditer `demo-data.ts` pour ne garder que les données réellement utilisées (les types `User`, `Annonce` utilisés par `DEMO_MODE`).

---

## 🟠 Mysterious Name / Leaky Abstraction — `fix.js` à la racine

`fix.js` (racine du projet)

Un script de remplacement de classe CSS (`text-muted` → `text-muted-foreground`) laissé à la racine du projet. Son nom ne décrit pas sa fonction, il n'est référencé dans aucun script `package.json`, et il a déjà été exécuté (le code source ne contient plus l'ancien token). C'est un artefact de migration qui n'a plus lieu d'être.

→ **Refactoring :** Supprimer le fichier. Si des opérations de migration CSS similaires sont nécessaires à l'avenir, les scripter dans `package.json` avec un nom explicite et les supprimer après usage.

---

## 🟡 Comments / Inline TODOs — Commentaires de structure dans le JSX

`app/(app)/accueil/page.tsx:42` — `{/* Les 4 boutons sortis */}`  
`app/(app)/accueil/page.tsx:62` — `{/* Nouvelle section Accès rapides */}`  
`app/(app)/consultations/page.tsx:30` — `// state -> consultation_id: option_id`  
`app/(app)/dashboard/actualites/ActualiteForm.tsx:79` — `// Compression : resizes to max...`  
`lib/supabase/server.ts:23` — `// The \`setAll\` method was called from a Server Component...`

Les commentaires JSX de structure (`{/* Les 4 boutons sortis */}`) n'apportent pas d'information que le code ne donne pas déjà. Les commentaires de code comme `// Compression : resizes to max 1200x1200...` décrivent le *quoi*, pas le *pourquoi*.

→ **Refactoring :** Supprimer les commentaires descriptifs. Si une section JSX est difficile à identifier, extraire le sous-composant avec un nom parlant. Le commentaire dans `server.ts` (copié depuis la doc Supabase) peut être conservé — il explique un comportement non évident.

---

## 🟡 Lazy Element — `purge_dups.js` dans `scripts/`

`scripts/purge_dups.js`

Script one-shot pour supprimer les logs de cron en doublon, probablement exécuté une seule fois suite à un bug (`correction problème expiration actualité` — commit `eaafc90`). Il lit `.env.local` directement avec du parsing manuel au lieu d'utiliser `dotenv`. Ce script n'a pas vocation à rester dans le dépôt.

→ **Refactoring :** Supprimer. Le bug à l'origine des doublons est corrigé dans le code applicatif. Si un script de maintenance DB est nécessaire ponctuellement, le documenter dans le README et ne pas le committer.

---

## Summary

**12 smells détectés : 4 🔴 critiques, 5 🟠 significatifs, 3 🟡 mineurs.**

**Point de départ recommandé :** Le smell **"Endpoint cron sans authentification"** est le plus urgent — c'est une faille de sécurité active qui peut être corrigée en décommentant 3 lignes. Immédiatement après, s'attaquer au **stockage base64 en DB** qui est à la fois un problème architectural et éco-design majeur.
