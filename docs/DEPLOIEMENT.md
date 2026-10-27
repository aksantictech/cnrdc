# Déploiement sur un serveur dédié

Gabarit Linux avec Docker Compose et Nginx. À valider sur le serveur cible avant ouverture aux utilisateurs. Les adresses et certificats sont des exemples. Ne pas copier `.local`, `.env` ou la base de démonstration dans un dépôt Git.

## Préparer

Prévoir un domaine, un serveur dédié, Docker/Compose, Nginx, un certificat TLS valide et une politique de sauvegarde. Conserver uniquement SSH et HTTPS ouverts ; PostgreSQL ne possède aucun port public dans la composition. Le service applicatif reste lié à la boucle locale derrière Nginx.

Copier les sources hors `node_modules`, `.local` et secrets. Depuis la racine Carto-CNS, avec Node installé, générer les secrets une seule fois :

```bash
node scripts/configuration-production.mjs https://carto-cns.votre-domaine.cd admin@votre-institution.cd
chmod 600 .env.production
docker compose --env-file .env.production -f infra/compose.production.yml build --pull
docker compose --env-file .env.production -f infra/compose.production.yml up -d
docker compose --env-file .env.production -f infra/compose.production.yml ps
curl -fsS http://127.0.0.1:5190/api/v1/health
```

Le générateur refuse d’écraser un fichier de secrets existant. L’initialiseur crée le schéma et le compte administrateur ; il ne charge aucune donnée fictive. Conserver les secrets dans un coffre. Les images sont versionnées par branche de maintenance ; les mettre à jour et contrôler les avis de sécurité à chaque déploiement. Pour des déploiements reproductibles, figer les digests validés des images dans votre pipeline.

Adapter `infra/nginx.conf.example` au domaine et aux chemins des certificats. Tester `sudo nginx -t`, puis recharger Nginx. Vérifier le site en HTTPS, les cookies de session, la connexion, les rôles et un parcours complet de collecte/validation. `APP_ORIGIN` doit correspondre exactement à l’origine HTTPS publique.

## Contrôles de version et santé

```bash
docker compose --env-file .env.production -f infra/compose.production.yml exec application node --version
docker compose --env-file .env.production -f infra/compose.production.yml logs --tail=50 application initialize
curl -fsS https://carto-cns.votre-domaine.cd/api/v1/health
```

Conserver le hash Git des sources déployées, le résultat de `npm audit --omit=dev`, les digests Docker et les résultats des tests avec chaque livraison. Un endpoint de santé positif confirme la connexion DB/PostGIS ; il ne prouve pas que toutes les fonctionnalités ni tous les correctifs sont déployés.

## Sauvegarde et mises à jour

Exemple Bash sur le serveur Linux :

```bash
umask 077
docker compose --env-file .env.production -f infra/compose.production.yml exec -T database pg_dump -U carto_owner -d carto_cns -Fc > carto-cns-backup.dump
```

Chiffrer et conserver une copie hors serveur ; tester la restauration dans une base séparée. Sauvegarder avant migration. Ne pas utiliser `docker compose down -v` sur une base à conserver : cette option supprime le volume. Le retour à une ancienne image applicative ne restaure pas une ancienne structure de base ; prévoir une restauration validée si une migration incompatible est introduite.

## API et systèmes tiers

API à la racine `/api/v1`. Connexion `POST /auth/login` avec `{email,password}` ; session en cookie. Routes métier : `/reports`, `/reports/:id`, `/reports/:id/status`, `/sync`, `/analytics`, `/institutions`, `/users`, `/api-keys`, `/audit`, `/exports/csv`, `/exports/xlsx`, `/exports/json`. Les droits sont contrôlés côté serveur, y compris pour les appels directs. La documentation descriptive minimale est exposée à `/openapi.json` sous le préfixe API.

Créer dans l’interface une clé API de durée et province adaptées. Elle n’est affichée qu’une fois. Exemple Bash sans inscrire la clé dans le code :

```bash
read -rs CNS_API_KEY
curl -fsS -H "Authorization: Bearer $CNS_API_KEY" \
  'https://carto-cns.votre-domaine.cd/api/v1/exports/json?period=historical&currency=USD'
unset CNS_API_KEY
```

Paramètres analytiques : `period=historical|forecast`, `currency=USD|CDF|EUR`, `year`, `province`, `source`, `domain`. Les exports portent sur les données validées. Au-delà de 100 000 lignes, réduire les filtres : l’API refuse l’export plutôt que de le tronquer silencieusement. La liste interactive des questionnaires est limitée à 1 000 éléments pour cette première version ; prévoir une pagination pour un déploiement de grande ampleur.

DHIS2 : les exports sécurisés sont disponibles, mais le transfert automatisé vers une instance réelle n’est pas configuré. Valider le mapping institutionnel, les nomenclatures SHA/PNDS et les règles de qualité avec le PNCNS avant une collecte officielle. Les limites géographiques et seuils d’alerte doivent aussi être approuvés.
