# Carto-CNS

Application locale indépendante de collecte CRSD pour le PNCNS / RDC. Web responsive et PWA, API REST Node.js/Fastify, PostgreSQL 18.4 et PostGIS 3.6.2. Aucun lien avec la base SANRU RH.

## Ouvrir sur cette machine

1. Ouvrir http://localhost:5190.
2. Les identifiants administrateur sont dans `.local/ACCES_LOCAL.txt` (fichier privé).
3. Après redémarrage du PC, double-cliquer sur `Demarrer-Carto-CNS.cmd` et garder sa fenêtre ouverte. Ctrl+C arrête l’API. Le moteur PostgreSQL local reste disponible.

Le runtime Node 24.22.1 et PostgreSQL/PostGIS sont installés dans `.local/runtime`. La base écoute uniquement sur `127.0.0.1:55435`, l’application sur `127.0.0.1:5190`. `Installer-Carto-CNS.ps1 -Demo` est idempotent : il initialise une installation disposant déjà de ces runtimes et ne remplace pas une base existante. Ce script ne télécharge pas les runtimes sur un autre PC.

## Fonctions livrées

- Identification et GPS, institution et répondant, projets SRMNEA-Nutrition, appuis financiers et matrice annuelle 2022–2028.
- Référentiels extraits du questionnaire fourni ; codes HF, HC et HP distincts des groupes de financement. Le champ SK reste un code national à faire valider par le PNCNS.
- Brouillons, soumission, revue du superviseur, validation finale centrale et retour motivé pour correction.
- Carte des 26 provinces, filtres par période/devise/province, indicateurs, fonctions et prestataires. Les montants de devises différentes ne sont jamais additionnés. Taux d’exécution = exécuté / décaissé.
- Exports CSV, JSON et véritable XLSX ; PDF via la fonction d’impression du navigateur.
- Gestion des utilisateurs, clés API de lecture avec expiration et province, journal d’activité.

Les 24 questionnaires et 168 lignes financières initiaux sont **fictifs**, signalés « démonstration ». Ils ne constituent pas les résultats de l’enquête. Les fichiers de référence n’ont pas été modifiés. Pour une collecte réelle, utiliser une nouvelle base vide sans `-Demo` ; ne pas mélanger cette démonstration avec des résultats officiels.

Le canevas PDF terrain est intégré en sept étapes avec tableaux D/E et signatures F. Consulter `docs/ANDROID_HORS_LIGNE.md`.

## Hors ligne et mobile

Se connecter une première fois, puis « Préparer mon appareil » et choisir une phrase de coffre d’au moins 10 caractères. Les données conservées dans IndexedDB sont chiffrées en AES-GCM ; la clé dérivée par PBKDF2 n’est gardée qu’en mémoire. Garder cette phrase : elle n’est pas récupérable par l’administrateur.

Enregistrer les brouillons avant de fermer la page. Après une coupure et un rechargement, déverrouiller le coffre pour reprendre le travail. Les modifications en attente se synchronisent lorsque la connexion et la session sont valides. Les conflits de version nécessitent une décision explicite ; aucune version distante n’est écrasée silencieusement. Une session expirée demande une reconnexion. La déconnexion efface le coffre de cet utilisateur sur cet appareil : synchroniser ou exporter les brouillons avant.

Le service worker conserve l’interface, les logos et les limites géographiques ; il ne met pas les réponses API en cache. L’installation PWA et le GPS dépendent des permissions du navigateur. Le déploiement mobile sur un serveur exige HTTPS ; l’adresse localhost actuelle n’est accessible que depuis ce PC. Il ne s’agit pas d’une application distribuée dans les stores.

## Rôles

| Rôle | Portée |
|---|---|
| ADMIN | Gestion centrale, utilisateurs, revue et validation finale, exports, clés API |
| SUPERVISOR | Questionnaires de sa province, revue et demandes de correction |
| COLLECTOR | Ses brouillons, GPS et soumissions dans sa province |
| ANALYST | Données validées, tableaux de bord et exports sans contacts des répondants |
| Clé API | Lecture des données validées, dans la province autorisée si renseignée |

La province de collecte détermine les droits. La province bénéficiaire d’une ligne financière détermine son affectation analytique ; à défaut, la province de collecte est utilisée.

## Sécurité et vérification

Mots de passe scrypt salés ; JWT signé en cookie HttpOnly/SameSite, sessions révocables, contrôle de l’origine des écritures, validation des entrées, paramètres SQL, restrictions par propriétaire/province, neutralisation des formules CSV, en-têtes CSP et protection contre les cadres. Le compte PostgreSQL applicatif ne peut ni créer de schéma ni modifier/supprimer le journal d’audit. Les clés API sont stockées sous forme de condensat. Les secrets et données restent exclus de Git.

29 tests passent sur cette installation, couvrant notamment PostGIS, RBAC, workflow, idempotence/synchronisation, conflits, séparation des devises, exports et révocation des sessions. Résultat dans `docs/test-results.log`. Audit npm : aucune vulnérabilité connue signalée lors du contrôle enregistré dans `docs/npm-audit.json`. Cela ne remplace pas un audit de sécurité avant exposition publique.

Pour relancer les tests, l’API doit fonctionner sur le port 5190 et `.local/bootstrap.json` doit être présent :

```powershell
.\.local\runtime\node\node.exe --test test/*.test.mjs
```

Les tests d’intégration créent puis nettoient uniquement leurs propres enregistrements sur la base locale explicitement vérifiée. Ne pas les pointer vers une base de production.

## Déploiement dédié

Voir `docs/DEPLOIEMENT.md`. Les fichiers Docker/Nginx sont préparés mais **aucun serveur n’a été déployé** et la composition Docker n’a pas été exécutée ici. Le connecteur DHIS2 nécessite encore le mapping des jeux de données, unités d’organisation et éléments de données de votre instance. Power BI peut consommer l’export JSON authentifié.

## Références

Questionnaire CNS Retravaillé V3.xlsx et CRSD_maquette_dashboard_powerbi.pptx fournis par l’utilisateur : extraction traçable dans `docs/questionnaire-source.json`, `docs/dashboard-reference.json` et `docs/reference-extraction.txt`. Les illustrations et logos fournis sont conservés dans `public/`.

Limites : [geoBoundaries COD ADM1](https://www.geoboundaries.org/api/current/gbOpen/COD/ADM1/), OSM/Wambacher, ODbL 1.0, limites 2017. Ces limites ne constituent pas un référentiel administratif officiel actualisé. SHA : [OMS, guide SHA 2011](https://www.who.int/publications/m/item/expenditure-on-prevention-activities-under-sha-2011-supplementary-guidance). Runtime spatial : [PostGIS Windows officiel](https://postgis.net/documentation/getting_started/install_windows/released_versions/).

## Espace utilisateur, paramètres et rapports

- En-tête institutionnel avec le logo fourni, animation respectant la préférence de réduction des mouvements, recherche et notifications des questionnaires à traiter et services non configurés.
- Menu utilisateur : profil, photo recadrée à 256 pixels, deux téléphones, e-mail et changement de mot de passe avec révocation des autres sessions.
- Paramètres réservés à ADMIN : utilisateurs, affectations, droits dans les limites de chaque rôle, référentiels (provinces, bailleurs, partenaires, zones et types), archives PostgreSQL, audit filtré et paginé, santé serveur, clés API et SMTP. Les suppressions liées à des données sont refusées au profit de l’archivage.
- Les sauvegardes complètes sont conservées dans .local/backups ; téléchargement administrateur uniquement. Le bouton crée une archive pg_dump au format personnalisé, vérifiée avec pg_restore --list. La restauration est une opération de maintenance manuelle.
- Configuration SMTP chiffrée avec une clé dérivée de JWT_SECRET. Le test vérifie TLS/STARTTLS et l’authentification sans envoyer d’e-mail. Aucun destinataire ni envoi automatique n’est configuré.
- Rapports & synthèses : filtres partagés par période, devise, province, source, bailleur, partenaire, domaine, institution et zone de santé. Regroupements par province, bailleur, partenaire, institution, domaine, année, source ou zone. Exports détaillés et synthèse CSV.
- Aperçu avant impression : en-tête CNS et ministère, date, auteur, critères sélectionnés et mention de démonstration si nécessaire, puis impression/PDF du navigateur en A4 paysage.
- Validation : npm test exécute les suites en série, y compris les scénarios temporaires de gestion de profil, droits, catalogue, SMTP et sauvegarde.

## Déploiement GitHub, Supabase et Vercel

Le dépôt cible est https://github.com/aksantictech/cnrdc et le projet Supabase est gvreudhsintnzlhonsqp. Le serveur Fastify est détecté via server.mjs et vercel.json ; Node 24 est requis. Le frontend et l’API sont sur la même origine HTTPS.

Le script `node scripts/prepare-supabase.mjs PROJECT_REF POOLER_HOST https://votre-domaine` prépare une migration privée dans `.local/supabase-migration.sql`, une copie des données et `.local/vercel.env`. Il lit la base locale sans l’altérer et teste la migration dans une transaction annulée. Exécuter la migration une seule fois dans un projet sans schéma carto : elle crée PostGIS, un schéma isolé carto et le rôle limité carto_runtime. Les tables ont RLS et n’autorisent que ce rôle ; les rôles Supabase anon et authenticated n’ont pas accès à ce schéma. Le script n’efface aucune donnée distante et échoue si le schéma existe déjà.

Les sessions locales et compteurs d’échec ne sont pas migrés. Les comptes, questionnaires, montants, référentiels, clés API hachées et le journal sont conservés. Le secret JWT d’origine est conservé dans Vercel pour permettre la lecture des paramètres SMTP chiffrés existants. Aucun secret ni export de données ne doit être ajouté à Git.

Dans Vercel, importer le dépôt et copier les variables du fichier privé `.local/vercel.env` dans Production. `DATABASE_URL` utilise le pooler transactionnel Supabase et le rôle carto_runtime.PROJECT_REF. `POSTGIS_SCHEMA` correspond au schéma de l’extension (extensions lors d’une création neuve). Ajuster APP_ORIGIN au domaine de production affecté par Vercel. Les aperçus ne doivent pas recevoir les secrets de production sans décision explicite.

Les archives pg_dump locales restent locales. En ligne, l’interface renvoie vers le tableau de bord de sauvegarde Supabase ; la disponibilité et la rétention dépendent de son offre. Pour un export logique indépendant des données applicatives : `node --use-system-ca --env-file=.local/vercel.env scripts/backup-supabase.mjs`. Le fichier privé .backup contient les données, comptes et paramètres ainsi que les définitions de tables ; il n’inclut pas les sessions ou l’infrastructure Supabase. Conserver également les secrets hors du dépôt dans un coffre.

La CI GitHub exécute les tests de calcul, sécurité métier et PWA sans base externe. `npm test` ajoute les intégrations locales et le test à deux instances Vercel, avec des comptes QA temporaires ; il nécessite les runtimes, la base locale et la migration privée préparée. Ces tests ne réinitialisent pas le compte administrateur de l’utilisateur.

Références : [Fastify sur Vercel](https://vercel.com/docs/frameworks/backend/fastify) et [connexions PostgreSQL Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).
