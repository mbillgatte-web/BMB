# Présentation de l'environnement logiciel et des technologies

Cette section décrit les outils et technologies retenus pour la réalisation de Build My Business, ainsi que les raisons de ces choix. Les versions indiquées sont celles du projet au moment de la rédaction (octobre 2026).

## 1. Vue d'ensemble

Build My Business est une application web organisée en trois niveaux :

| Niveau | Rôle | Technologies |
|---|---|---|
| Présentation | Interface utilisateur dans le navigateur | Next.js, React, TypeScript, Tailwind CSS, Framer Motion |
| Application | Logique métier, routes API, intégration de l'IA | Next.js (routes serveur), TypeScript |
| Données et services | Stockage, authentification, IA, hébergement | Supabase (PostgreSQL, Auth, Storage), Google Gemini, OpenRouter, Vercel |

Le choix d'un environnement entièrement JavaScript/TypeScript, du navigateur au serveur, permet de partager les types et les règles métier entre les couches et de limiter le nombre de langages à maîtriser.

## 2. Langage et exécution

**TypeScript 5.** Surcouche typée de JavaScript. Chaque entité du modèle (compte, entreprise, identité visuelle, site, projet, étude de faisabilité) est décrite par une interface, ce qui permet de détecter les erreurs à la compilation plutôt qu'à l'exécution. La commande `tsc --noEmit` est exécutée avant chaque livraison.

**Node.js 24.** Environnement d'exécution du serveur et des outils de développement (gestionnaire de paquets npm 11, scripts de capture des aperçus de modèles).

## 3. Cadre applicatif : Next.js 16 et React 19

**React 19** est la bibliothèque d'interface. L'application est découpée en composants réutilisables (champs de formulaire, boutons, cartes, composeur de conversation avec l'IA) rangés dans le dossier `src/components`.

**Next.js 16** est le cadre construit sur React. Il apporte :
- le routage par dossiers (`src/app`) : chaque écran correspond à un dossier, par exemple `src/app/Projets/[id]/etude` pour l'étude de faisabilité d'un projet ;
- les routes API côté serveur (`src/app/api`), qui portent la logique sensible : appels à l'IA avec les clés secrètes, publication des sites, création des comptes ;
- le rendu côté serveur et l'optimisation automatique des polices et des images ;
- le fichier `proxy.ts`, exécuté avant chaque requête, utilisé pour router les sous-domaines des sites publiés.

Ce choix s'explique par la possibilité de développer l'interface et le serveur dans un seul projet, et par l'hébergement natif sur Vercel.

## 4. Interface et style

**Tailwind CSS 4.** Système de classes utilitaires. Les couleurs de la plateforme sont définies une seule fois sous forme de jetons (`primary`, `secondary`, `surface`, `error`…) dans `tailwind.config.ts`, ce qui garantit la cohérence visuelle et facilite un changement de charte.

**Framer Motion 13.** Bibliothèque d'animation pour les transitions entre étapes de formulaire, l'ouverture du menu mobile et les apparitions en cascade.

**Lucide et Phosphor Icons.** Jeux d'icônes vectorielles.

**Google Fonts.** Polices proposées aux entrepreneurs pour leur identité visuelle (Inter, Montserrat, Playfair Display, Rubik, Roboto, etc.), chargées et optimisées par Next.js.

## 5. Données, authentification et stockage : Supabase

Supabase est une plateforme hébergée construite autour de PostgreSQL. Elle fournit, sans serveur à administrer :

- **PostgreSQL** : base de données relationnelle. Tables `compte`, `entreprise`, `identite_visuelle`, `site`, `projet`, `etude_faisabilite`, décrites par des scripts de migration versionnés dans `supabase/migrations`.
- **Row Level Security (RLS)** : règles de sécurité au niveau des lignes. Chaque table ne laisse un utilisateur lire ou modifier que les données de ses propres entreprises, vérification faite par la base elle-même et non par le code applicatif.
- **Auth** : inscription et connexion par email et mot de passe, gestion des sessions.
- **Storage** : stockage des fichiers (logos, images des sites) dans des buckets.

Dans le code, tous les accès à Supabase sont regroupés dans le dossier `src/data`, un fichier par table. Une règle ESLint interdit toute requête à la base en dehors de ce dossier, ce qui impose la séparation entre la couche de données et le reste de l'application.

## 6. Intelligence artificielle

**Google Gemini (API Generative Language).** Modèle de langage utilisé pour la génération et la modification de sites web par conversation, et prévu pour la rédaction des études de faisabilité. L'appel est fait côté serveur avec le modèle `gemini-3.6-flash`, avec reprise automatique sur des modèles de secours en cas de surcharge. Les consignes envoyées au modèle (style, typographie, interdictions, format de réponse) sont centralisées dans `src/lib/promptSiteIA.ts`.

**OpenRouter.** Passerelle donnant accès à plusieurs modèles de génération d'images à travers une seule API. Utilisée pour les visuels marketing, à partir de l'identité visuelle de l'entreprise.

Dans les deux cas, les clés d'accès restent sur le serveur et ne sont jamais transmises au navigateur.

## 7. Hébergement et déploiement

**Vercel.** Plateforme d'hébergement conçue pour Next.js. Chaque envoi sur la branche principale du dépôt déclenche automatiquement la construction et la mise en ligne de l'application. Les variables d'environnement (clés Supabase, Gemini, OpenRouter) y sont configurées sans figurer dans le code source.

**Git et GitHub.** Gestion de versions et hébergement du dépôt, avec une branche de travail par fonctionnalité.

## 8. Outils de développement

| Outil | Usage |
|---|---|
| Visual Studio Code | Éditeur de code |
| ESLint 9 | Analyse statique du code et règles propres au projet |
| Google Chrome (mode headless) | Capture automatique des aperçus des modèles de sites (`scripts/capture-templates.mjs`) |
| PowerAMC | Modélisation UML (cas d'utilisation, classes, paquetages) |
| Claude Code | Assistant de développement utilisé pour la génération de code, les audits d'interface et la relecture des diagrammes |

## 9. Justification des choix

- **Un seul langage de bout en bout** : TypeScript du navigateur au serveur, moins d'erreurs d'intégration et un seul outillage.
- **Pas de serveur à administrer** : Supabase et Vercel sont des services gérés, ce qui convient à un projet mené par une seule personne et à un déploiement rapide.
- **Sécurité portée par la base** : les règles RLS protègent les données même si une route applicative contenait une erreur.
- **IA isolée et remplaçable** : les appels aux modèles sont confinés dans quelques fichiers de `src/lib` et `src/app/api` ; changer de fournisseur ne touche pas le reste de l'application.
- **Coût nul au démarrage** : tous les services utilisés disposent d'un palier gratuit suffisant pour la phase de développement et de test.
