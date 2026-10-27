# Carto-CNS : PWA Android et canevas terrain

Version adaptée au document `Questionnaire_Terrain_PNCNS_CRSD_V5_Entete.pdf` fourni le 27 octobre 2026 (six pages, pied de page interne « V4 »). Le PDF original n’a pas été modifié.

## Correspondance

| Canevas | Application |
|---|---|
| Identification | Étape 1 : province, enquêteur, téléphone, email, période, date ; zone de santé et GPS complémentaires |
| Section 0 | Étapes 1–2 : répondant, institution, responsable, adresse, contacts, exercice fiscal, monnaies et sources |
| Section C | Étape 3 : référence, intitulé, description, objectif, dates, statut et zones d’intervention |
| Matrice financière / PNDS | Étape 4 : lignes détaillées, budgets prévu/engagé/décaissé/exécuté, classifications et justificatif |
| D.1 | Étape 5 : sept catégories de financement, dépenses 2022–2024 et devise par ligne |
| D.2 | Étape 5 : cinq domaines SRMNEA-Nutrition, dépenses 2022–2024 en USD |
| E | Étape 6 : cinq catégories de sources, prévisions 2025–2028 en USD |
| F | Étape 7 : attestation, identité/fonction/dates, visa terrain et deux signatures manuscrites |

Les cases récapitulatives D/E peuvent rester vides si non applicables ; zéro est une valeur distincte. Les totaux USD excluent les autres devises. Les conversions sont documentées, jamais inventées automatiquement. D.1/D.2/E sont conservés comme récapitulatifs du questionnaire et ne sont pas additionnés aux lignes détaillées du tableau de bord. Renseigner la matrice détaillée pour alimenter les analyses. Les signatures et contacts ne sont pas transmis aux analystes ou aux consommateurs API.

Le champ « Autre monnaie » permet de documenter une monnaie institutionnelle supplémentaire ; les montants analytiques restent en USD/CDF/EUR, et D.2/E en USD suivant le canevas. Les dates de projet sont saisies au jour près dans cette version ; pour une information au mois près, documenter le jour conventionnel dans la description.

## Installation sur Android

1. Déployer sur le serveur dédié avec un domaine HTTPS et un certificat valide (voir `DEPLOIEMENT.md`). L’adresse `localhost:5190` de cette machine n’est pas une adresse utilisable depuis le téléphone.
2. Ouvrir l’adresse HTTPS dans Chrome Android, puis « Installer sur Android » dans Carto-CNS ou menu Chrome ⋮ → Installer l’application.
3. Ouvrir l’icône Carto-CNS, se connecter et préparer le coffre chiffré. Choisir une phrase secrète de dix caractères minimum et la conserver.
4. Avant la mission, passer en mode avion, fermer/réouvrir la PWA, ouvrir le coffre, saisir un questionnaire et vérifier sa conservation après rechargement.
5. De retour en ligne, laisser la PWA ouverte : la file de brouillons et les demandes de soumission se transmettent automatiquement. Une session expirée exige une reconnexion. Un conflit exige une comparaison explicite.

Il est possible d’enregistrer la demande de soumission hors ligne après vérification de la fiche et signatures. La revue provinciale et la validation centrale restent des opérations serveur. La synchronisation automatique s’exécute lorsque la PWA est ouverte : la livraison n’utilise pas une synchronisation garantie lorsque Android ferme l’application en arrière-plan.

La géolocalisation fonctionne selon le GPS et les autorisations du téléphone ; sans position disponible, conserver le brouillon et compléter plus tard. L’application n’envoie aucune donnée financière vers un service cartographique externe pour afficher la carte.

## Vérifications effectuées

29 tests automatisés passent : canevas, rubriques, dates, montants exacts, signatures, persistance API, contrôle d’accès, workflow, idempotence, conflits, exports et service worker sans réseau. Un brouillon chiffré a été récupéré après coupure et rechargement dans le navigateur local avant cette adaptation. Les nouveaux tableaux ont été vérifiés dans l’interface et leur persistance contrôlée par l’API. Le second contrôle interactif de coupure a été interrompu par l’indisponibilité de l’outil navigateur ; il ne constitue pas une validation sur téléphone.

L’installation effective et un essai en mode avion sur un appareil Android restent à réaliser après déploiement HTTPS. Aucun serveur dédié n’a encore été déployé.

Références : [installation des PWA, MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable), [invite d’installation, web.dev](https://web.dev/learn/pwa/installation-prompt).
