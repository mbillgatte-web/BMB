# I. GUIDE D'INSTALLATION

## 1. Prérequis

Avant d'installer Build My Business, il est nécessaire de disposer des éléments suivants :

- Un ordinateur sous Windows, macOS ou Linux ;
- Node.js (version 20 ou supérieure) et npm ;
- Git (pour récupérer le code source) ;
- Un compte Supabase (gratuit) pour la base de données, l'authentification et le stockage des fichiers ;
- Une clé d'API Google Gemini (gratuite, obtenue sur Google AI Studio) pour la génération des sites ;
- Une clé d'API OpenRouter (facultative) pour la génération des visuels marketing ;
- Une connexion internet (installation des dépendances et accès aux services).

## 2. Récupération du projet

1. Récupérer le code source : `git clone https://github.com/mbillgatte-web/BMB.git` ou décompresser l'archive fournie.
2. Se placer dans le dossier du projet : `cd BMB`
3. Installer les dépendances : `npm install`

## 3. Configuration de la base de données (Supabase)

1. Créer un nouveau projet sur https://supabase.com et noter l'URL du projet et la clé publique (« anon key »), disponibles dans Project Settings, API.
2. Ouvrir l'éditeur SQL du projet (SQL Editor) et exécuter, dans l'ordre, le contenu de chaque fichier du dossier `supabase/migrations` :
   - `20260901000000_schema_initial.sql` : tables comptes, entreprises, identités visuelles, sites, règles de sécurité et buckets de stockage ;
   - `20260930120000_publication_site.sql` : publication des sites ;
   - `20261001090000_projet.sql` : projets ;
   - `20261002100000_etude_faisabilite.sql` : études de faisabilité.
3. Dans Authentication, Providers, vérifier que la connexion par email est activée. Pour les tests en local, désactiver la confirmation d'email (Authentication, Settings, « Confirm email ») afin que l'inscription connecte directement l'utilisateur.

## 4. Configuration des variables d'environnement

1. Copier le fichier d'exemple : `copy .env.example .env.local` (Windows) ou `cp .env.example .env.local` (Linux/macOS).
2. Renseigner les valeurs dans `.env.local` :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé publique du projet Supabase |
| `GEMINI_API_KEY` | clé Google AI Studio |
| `GEMINI_TEXT_MODEL` | modèle de texte (laisser la valeur par défaut) |
| `OPENROUTER_API_KEY` | clé OpenRouter (facultatif) |
| `NEXT_PUBLIC_DOMAINE_RACINE` | laisser vide en local |

Le fichier `.env.local` contient des secrets : il ne doit jamais être partagé ni ajouté au dépôt Git.

## 5. Lancement de l'application

1. Lancer le serveur de développement : `npm run dev`
2. L'application est accessible par défaut à l'adresse http://localhost:3000.
3. Créer un compte depuis la page d'inscription, puis créer une première entreprise depuis le tableau de bord.

## 6. Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement avec rechargement automatique |
| `npm run build` | compilation de la version de production |
| `npm start` | lancement de la version compilée |
| `npm test` | exécution des tests unitaires |
| `npm run lint` | vérification du code |
| `npm run templates:capture` | régénération des aperçus des modèles de sites (nécessite Google Chrome) |

## 7. Déploiement en ligne (facultatif)

1. Créer un compte sur https://vercel.com et importer le dépôt GitHub.
2. Dans les paramètres du projet Vercel, Environment Variables, saisir les mêmes variables que dans `.env.local`.
3. Chaque envoi sur la branche principale déclenche automatiquement la mise en ligne. L'application est alors accessible à l'adresse fournie par Vercel, par exemple https://bmb-ashen.vercel.app.
