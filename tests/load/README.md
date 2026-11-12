# Test de charge Le Rameau

Ce test reproduit un parcours de resident connecte sur la branche Vercel `preprod` et les appels Supabase effectues par les ecrans du projet. Il remplace le premier script, qui ne parcourait que l'accueil public et les pages legales.

## Configuration, une seule fois

1. Verifier `k6 version` dans le terminal PowerShell du projet.
2. Copier `tests/load/config.example.json` vers `tests/load/config.local.json`.
3. Dans ce fichier local, remplacer `supabaseUrl` et `supabaseAnonKey` par l'URL et la cle publique du projet utilise par la preproduction. Elles se trouvent dans les parametres API Supabase ou les variables Vercel `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Ne pas utiliser de cle `service_role` ou `sb_secret_`.
4. Renseigner l'email et le mot de passe d'un compte de test existant, confirme, avec le role `membre` et un appartement renseigne. Garder les identifiants sur la machine : ne pas les envoyer dans le chat ou les captures.
5. Verifier depuis l'interface qu'il existe au moins une actualite non expiree, une consultation active et une piece jointe PDF ou image (PNG, JPEG, GIF, WebP) dans Assemblee Generale. Le fichier doit avoir ete ajoute depuis l'application, dans le bucket Storage `ag-fichiers`, ou etre integre en base64. Une carte vide ou un simple lien externe ne suffit pas. Le test ne cree aucune de ces donnees.

Le fichier `config.local.json` et les rapports sont ignores par Git. Le modele contient uniquement des valeurs fictives. Un lancement sans configuration s'arrete avec un message explicatif, sans commencer la charge.

Si Vercel protege les previews, aller dans le projet `le-rameau`, puis `Settings > Deployment Protection > Protection Bypass for Automation`, et generer un secret. Ajouter `"vercelAutomationBypassSecret": "LE-SECRET-GENERE",` dans `config.local.json`, au meme niveau que `supabaseUrl`. La variable de terminal `VERCEL_AUTOMATION_BYPASS_SECRET` est aussi acceptee et reste prioritaire. Ce secret n'est envoye qu'a Vercel et n'est pas inclus dans les rapports. Si la preparation est redirigee vers l'authentification Vercel, le script signale ce reglage precisement. Ne pas employer `--http-debug`, qui afficherait les identifiants et les sessions.

## Execution

Depuis la racine du projet, commencer par un seul parcours a un client :

```powershell
.\tests\load\run-preprod.ps1 -Profile smoke
```

Pour une demonstration courte avec au maximum 5 clients :

```powershell
.\tests\load\run-preprod.ps1 -Profile demo
```

Pour la mesure complete avec au maximum 30 clients :

```powershell
.\tests\load\run-preprod.ps1 -Profile load
```

Si l'execution des fichiers PowerShell est bloquee, utiliser par exemple `pwsh -ExecutionPolicy Bypass -File .\tests\load\run-preprod.ps1 -Profile smoke`. Cette option concerne uniquement le processus lance.

Le lancement direct charge automatiquement `tests/load/config.local.json`, sans variable supplementaire. Il utilise le mode `smoke` par defaut :

```powershell
k6 run tests/load/preprod.k6.js
```

Le chemin du fichier local est resolu par rapport au script k6, pas au dossier du terminal. Pour choisir un autre fichier, renseigner `K6_CONFIG_FILE` avec son chemin. Les variables d'environnement conservent la priorite sur les valeurs du fichier. Le lanceur PowerShell renseigne aussi les informations de version et de revision locale pour les rapports.

## Comptes distincts et sessions partagees

Le mode `smoke` demande un seul compte. Ajouter plusieurs objets email/password dans `accounts` pour la charge. Par defaut, il faut 5 comptes differents en mode `demo` et 30 en mode `load`. Chaque compte est authentifie une seule fois pendant la preparation, puis associe a un client virtuel. La duree de vie des jetons doit depasser 15 minutes.

Si tu ne disposes que d'un ou de quelques comptes, `"allowSharedAccounts": true` autorise leur reutilisation. Les 30 clients font alors des requetes en partageant ces comptes et leurs sessions. Le terminal et le rapport affichent cette limite. Ce mode mesure des lectures concurrentes, mais ne permet pas de parler de 30 residents distincts ni de 30 authentifications simultanees. Pour une mesure representant mieux les residents, utiliser plusieurs comptes de test et plusieurs appartements. Aucun compte n'est cree par le script.

## Parcours mesure

Chaque client suit les memes etapes, avec une pause de lecture aleatoire de 2 a 5 secondes entre les rubriques :

1. Acces a `/accueil`, lecture de son profil et des 20 dernieres notifications.
2. Acces a `/actualites`, lecture des actualites non expirees puis d'un article choisi dans la liste.
3. Acces a `/ag`, lecture de la liste puis telechargement d'une piece jointe d'assemblee generale et verification de sa signature.
4. Acces a `/consultations`, lecture des consultations actives et des votes existants pour son appartement.

Les requetes reprennent les tables, les filtres et les tris du code actuel. Les fichiers ajoutes depuis le tableau de bord AG sont stockes dans le bucket public Supabase `ag-fichiers`. La reponse de `assemblee_generale` contient leurs liens. Le formulaire accepte aussi des images : les fichiers presents lors de la verification etaient des PNG. Le test effectue donc un GET du fichier, comme lors de son ouverture depuis l'application, et controle sa signature binaire ainsi que son type MIME. PDF, PNG, JPEG, GIF et WebP sont couverts. Ce controle identifie le format sans analyser toute la structure du fichier. Un statut 200 contenant du HTML ne suffit pas. Seules les URL de ce bucket dans le projet Supabase configure sont utilisees, sans transmettre la cle de contournement Vercel ni charger les liens externes des cartes. Les fichiers integres en base64 restent acceptes : leur transfert est deja inclus dans la reponse PostgREST.

Le script utilise les cookies de session au format `@supabase/ssr` du projet et le jeton utilisateur pour PostgREST. Les politiques de securite Supabase restent appliquees. Une redirection vers `/login`, une erreur API ou une reponse JSON inattendue compte comme un echec, meme si une page d'erreur renvoie le statut 200. Les listes de votes et notifications peuvent etre vides ; l'actualite, le document et la consultation doivent exister.

Les pages sont chargees au niveau HTTP. k6 ne rend pas React : le test verifie l'enveloppe HTML et reproduit explicitement les requetes de donnees que le navigateur ferait ensuite. Il ne mesure pas la performance visuelle, le JavaScript, les images ou les connexions temps reel.

## Charge et seuils

La mesure `load` dure 4 min 45 s, hors preparation et fin des parcours. Elle comporte une rampe de 30 s jusqu'a 5 clients, un palier de 45 s, une rampe de 30 s jusqu'a 15 clients, un palier de 60 s, une rampe de 30 s jusqu'a 30 clients, un palier de 60 s puis une descente de 30 s. Le mode `demo` monte a 5 clients en 15 s, les maintient 45 s et redescend en 15 s.

Pour une residence de 80 a 100 lots, 5 clients representent une utilisation courante supposee, 15 une periode plus active et 30 une pointe apres une annonce ou l'ouverture d'une consultation. Ce sont des hypotheses a confronter aux usages reels, pas des statistiques de frequentation deja observees.

Les objectifs sont fixes avant execution. Ils ne doivent pas etre augmentes pour faire passer un test en echec :

- Moins de 1 % d'erreurs HTTP pendant la mesure.
- 90 % des reponses HTTP sous 800 ms, 95 % sous 1 200 ms. Le p95 est aussi controle pour chaque operation et chaque palier stable.
- Au moins 99 % de parcours reussis, sans accepter une reponse au mauvais contenu.
- Chaque operation doit avoir ete executee, au moins une piece jointe doit avoir ete validee, un parcours doit etre termine et le maximum de clients prevu doit avoir ete atteint.

Le GET Storage `document_fichier` est soumis au meme objectif p95 de 1 200 ms et apparait dans le rapport. Le rapport distingue les fichiers Storage effectivement telecharges des fichiers integres. Si seules des donnees integrees sont presentes, cette metrique HTTP ne recoit pas d'echantillon : leur transfert reste mesure sur l'operation `documents`.

Les pauses de lecture ne sont pas incluses dans le temps de reponse HTTP. Une autre metrique indique la duree complete du parcours avec ces pauses. L'authentification et les controles initiaux sont separes des mesures de charge. L'essai court peut echouer sur un demarrage a froid : conserver le resultat et expliquer le contexte, plutot que masquer la premiere mesure.

## Rapports et interpretation

Chaque lancement produit deux fichiers dates dans `tests/load/results` : un HTML lisible dans le navigateur et un JSON contenant les mesures agregees. Le rapport rappelle le profil, l'URL, les comptes distincts, les seuils et les limites. Aucun mot de passe, jeton, email ou contenu de document n'est exporte. Les reponses et les sessions de preparation ne sont pas copiees dans le JSON.

Un p95 de 600 ms signifie que 95 % des reponses de l'echantillon ont pris au maximum environ 600 ms. Comparer les p95 des paliers 5, 15 et 30 pour voir si les reponses ralentissent. Relever aussi les erreurs, le debit et le nombre de parcours termines. Une reussite a 30 clients ne donne pas la capacite maximale du site ni un seuil de rupture.

Conserver le rapport d'un lancement reel sur preprod avec sa date. Ajouter le commit et l'identifiant du deploiement depuis Vercel, les conditions reseau et les graphiques Vercel/Supabase observes sur la meme periode. k6 ne mesure pas directement leur CPU ou leur memoire. Si un seuil echoue, expliquer quelle operation ralentit, chercher la cause et relancer le meme protocole apres correction. Ne pas reutiliser les chiffres du premier script public comme resultat du nouveau parcours.

La base Supabase est pour le moment partagee avec l'autre deploiement. Le test utilise les pages de preprod mais ses appels de donnees sollicitent cette base partagee. Aucune donnee metier n'est modifiee ; les connexions creent toutefois des sessions et peuvent alimenter les journaux d'authentification Supabase. Le script ne declenche pas la journalisation de connexion propre a l'interface React.

## Verification technique du script

```powershell
node --test tests/load/preprod.test.mjs
```

Ces verifications utilisent un serveur factice local pour controler les cookies, les erreurs, les rapports et les donnees manquantes. Elles ne sont jamais des resultats de charge de l'application et sont marquees comme telles dans les rapports temporaires.

References : [seuils k6](https://grafana.com/docs/k6/latest/using-k6/thresholds/), [cookies k6](https://grafana.com/docs/k6/latest/using-k6/cookies/), [rapports personnalises](https://grafana.com/docs/k6/latest/results-output/end-of-test/custom-summary/), [sessions serveur Supabase](https://supabase.com/docs/guides/auth/server-side/advanced-guide). Le format exact des cookies a aussi ete verifie dans la version `@supabase/ssr` installee dans le projet.
