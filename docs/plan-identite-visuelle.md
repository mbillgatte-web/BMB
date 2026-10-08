# Plan de correction : pages Identité visuelle

Pages concernées : `/IdentiteVisuelle` (vue d'ensemble), `/PaletteColor`, `/Typographie`, `/Logo`.
Source : audit du 3 octobre (section 6) + relecture des composants + vérification dans le navigateur le 4 octobre.
Aucun fichier n'a été modifié : ce document sert à valider avant de toucher au code.

---

## 1. Ce que tu verras en ouvrant chaque page

### `/PaletteColor` : Palette de couleurs

1. **Regarde l'aperçu à gauche** : le grand titre dit « Elevate your brand identity. », le paragraphe « Create cohesive, stunning visual systems… », les boutons « Get Started » et « Learn More ». Tout est en anglais et parle d'un logiciel fictif, pas de ton entreprise. Tu ne vois jamais ton nom, ton slogan ni ton secteur : impossible de juger si la palette te convient.
2. **Regarde en haut de l'aperçu** : le titre de la zone est « Live Preview », la carte de droite s'appelle « Curated Palettes », les onglets « 2 Colors / 3 Colors », les lignes d'édition « Primary Action / Background / Accent ». Mélange anglais-français sur une seule page.
3. **Fais défiler** : le bouton vert arrondi « Continuez vers la typographie » flotte en bas et passe par-dessus les palettes « Warm Amber » et « Eco Green », puis par-dessus la carte d'édition. Il cache ce qu'il faut choisir avant de continuer.
4. **Regarde la carte « Editer manuellement les couleurs »** : tu peux cliquer sur les carrés de couleur et choisir une teinte, mais rien ne se passe (ni l'aperçu, ni la palette ne changent). C'est une fonction pas encore branchée, présentée comme si elle marchait, sans la mention « Bientôt ».
5. **Regarde le coin supérieur droit de l'aperçu** : une tache floue de la couleur primaire ; la carte « Générer avec l'IA » a un fond dégradé et un halo flou dans son coin. Décor sans fonction, typique des maquettes générées.
6. **Les noms des palettes** : « Corporate Indigo », « Editorial Mono », « Warm Amber », « Eco Green ». Noms anglais, et aucune n'est pensée pour un secteur camerounais (commerce, agroalimentaire, BTP, services…).
7. **La barre de progression** : « Vue d'ensemble → Palette → Typographie → Logo ». Sur la page de création d'entreprise, la liste d'étapes dit « Votre entreprise → Palette → Typographie → Logo ». Deux parcours différents pour la même chose.
8. **Si l'entreprise n'est pas trouvée** : le message apparaît en rouge vif Tailwind, sans lien avec le reste de la charte (rouge « error » du thème).
9. **Détail** : la petite étincelle devant « Générer avec l'IA » et la flèche du bouton viennent de la police d'icônes Google (Material), alors que le reste de la plateforme utilise Lucide. Le trait n'a pas la même épaisseur.

### `/Typographie` : Typographie

1. **Regarde l'aperçu à gauche** : « TYPOGRAPHY SYSTEM », « Design is intelligence made visible. », « Elevate your brand with precision and clarity. », puis un paragraphe anglais sur « our workspace ». Boutons « Primary Action » / « Secondary ». Même problème : c'est une page de démonstration, pas ta marque.
2. **Regarde la couleur du texte courant** : le paragraphe de l'aperçu et le sous-titre « Sélectionnez une paire de polices… » sont **bleu-vert**, pas gris. C'est parce qu'ils utilisent la couleur « secondary » du thème, qui est un bleu-vert d'accent, pas une couleur de texte. On croit que c'est un lien.
3. **Regarde le titre de la colonne de droite** : « Choissez votre Police » (faute d'orthographe, majuscule injustifiée).
4. **Regarde les cartes de polices** : chacune affiche « Your Brand Voice », « H: Playfair Display », « B: Inter ». Nom des paires en anglais (« Elegant Editorial », « Modern Corporate », « Bold Minimal », « Classic Serif », « Brand Heading »). « H » et « B » ne veulent rien dire pour quelqu'un qui n'est pas designer.
5. **Fais défiler** : le bouton flottant « Importez votre logo » recouvre les cartes de polices et la carte d'édition manuelle. En plus, son libellé annonce l'étape suivante au lieu de dire « Continuer ».
6. **Regarde le coin de l'aperçu et la carte IA** : même halo flou et même fond dégradé que sur Palette.
7. **Regarde le haut de l'aperçu** : trois pastilles grises façon fenêtre macOS et une fausse barre d'adresse. Ça fait croire que tu regardes un site web, alors que c'est juste un échantillon de texte.
8. **Les boutons radio des cartes** : icône Material (« radio_button_checked ») alors que la page d'ensemble utilise Lucide.

### `/Logo` : Logo

1. **Regarde le haut de la page** : trois titres empilés : « Logo de votre marque » (gros), puis « Création de Logo » (encore gros), puis « Aperçu en direct ». Deux phrases d'introduction qui disent la même chose. Tu dois descendre d'un écran avant d'arriver au contenu utile.
2. **Fais défiler** : le bouton « Terminer l'identité visuelle » flotte par-dessus la zone de dépôt du logo, c'est-à-dire précisément là où tu dois glisser ton fichier.
3. **Regarde l'aperçu** : une carte de visite penchée, avec une fusée dans un rond et des barres grises à la place du texte. Elle se redresse quand tu passes la souris. Rien n'indique le nom de ton entreprise ; la fusée n'a aucun rapport avec un logo camerounais.
4. **Essaie au clavier** : la zone « Glissez et déposez » se prend au focus mais Entrée ou Espace n'ouvrent pas le sélecteur de fichier ; seul le bouton à l'intérieur fonctionne. Un bouton dans un bouton, c'est un piège pour les lecteurs d'écran.
5. **Essaie d'importer un fichier SVG ou une image de 30 Mo** : tout passe. Rien ne te dit la limite de taille ni les formats acceptés, et le texte conseille le SVG (format que l'API ne devrait pas accepter : il peut contenir du code).
6. **Regarde le message d'erreur** quand tu cliques sur Terminer sans entreprise : « Entreprise introuvable, recommence depuis… » : le site te tutoie alors qu'il te vouvoie partout ailleurs. Et il est en rouge Tailwind, pas en rouge de la charte.
7. **Regarde les icônes** : nuage d'envoi, étincelle, coche du bouton, fusée : toutes de la police Google Material, différentes de Lucide utilisées dans la barre latérale.
8. **Texte courant** encore en bleu-vert (même cause que sur Typographie).

### `/IdentiteVisuelle` : Vue d'ensemble

1. **Regarde la barre de progression** : « Vue d'ensemble » y figure comme étape 1, alors que ce n'est pas une étape : c'est un récapitulatif. Le rond vert « 1 » laisse croire que tu as « fait » quelque chose ici.
2. **Regarde les trois cartes** : Palette, Typographie, Logo, exactement de la même taille, chacune avec une petite icône dans un rond coloré (vert, bleu-vert, autre). Trois cartes identiques, aucune hiérarchie : rien ne dit ce qui manque ni ce qu'il faut faire ensuite.
3. **Regarde la carte Typographie** : « Titres — non défini », « Texte — non défini » si rien n'est enregistré ; tiret long et libellé vague.
4. **Si rien n'est encore configuré** : état vide correct (« Vous n'avez pas encore configuré… » + bouton « Commencer par la palette »). C'est le seul écran de la série qui utilise déjà le bon bouton de la plateforme.
5. **Si l'entreprise n'est pas chargée** : trois blocs gris qui clignotent, puis un message d'erreur dans un cadre rouge pâle. Correct, mais le message vient de la base de données (phrase technique).

### Transversal (visible sur les 4 pages)

- Fond de page gris fixe différent de la page de création d'entreprise (beige), alors qu'on enchaîne les deux.
- La barre latérale indique « Strategic Suite » sous le nom de l'entreprise et une icône « étincelle » pour « Logo » : hors périmètre ici, déjà noté dans l'audit section 1.

---

## 2. Ce que je compte faire

Principes communs : tout en français ; l'aperçu montre **ton** entreprise (nom, slogan, secteur lus par le hook `useEntreprise`, avec un repli « Nom de votre entreprise » si vide) ; fonds plats, zéro dégradé, halo, étincelle ou pastille macOS ; un seul bouton « Continuer » dans le flux de la page, avec le bouton standard de la plateforme (contour qui se remplit, flèche animée) ; un seul stepper « Entreprise → Palette → Typographie → Logo » ; un seul titre par page ; texte courant en gris lisible (`on-surface-variant`) ; icônes Lucide uniquement ; erreurs avec le rouge de la charte ; mention « Bientôt » sur tout ce qui n'est pas branché.

### `/PaletteColor`

| Avant | Après |
|---|---|
| Aperçu « Elevate your brand identity. » + texte SaaS anglais + « Get Started / Learn More » | Aperçu avec le **nom de ton entreprise** en titre, ton **slogan** en sous-titre (ou une phrase de repli en français), ton **secteur** en petite étiquette ; boutons « Nous contacter » et « En savoir plus » |
| Fausse barre de navigateur à pastilles | Cadre simple avec un libellé « Aperçu » |
| Tache floue dans le coin de l'aperçu, dégradé et halo sur la carte IA | Fonds plats, bordure fine |
| « Live Preview », « Curated Palettes », « 2 Colors / 3 Colors », « Primary Action / Background / Accent », « Accent color » | « Aperçu », « Palettes proposées », « 2 couleurs / 3 couleurs », « Couleur principale / Fond / Accent » |
| Bouton « Continuez vers la typographie » flottant et collant | Bouton « Continuer » du composant standard, placé en bas de la colonne de droite, dans le flux, jamais par-dessus le contenu |
| Carte « Editer manuellement les couleurs » active mais inopérante | Même carte, contrôles désactivés, badge « Bientôt » dans le titre (comme la carte IA) |
| Étincelle et flèche Material | Icônes Lucide (`Sparkles`, flèche du bouton standard) |
| Erreur en rouge Tailwind | Erreur en jeton `error`, placée juste sous le bouton Continuer |
| Classe CSS `canvas-shadow` inexistante sur les cartes | Retirée (ombre légère standard) |
| Noms de palettes anglais | Voir décision 1 ci-dessous |

### `/Typographie`

| Avant | Après |
|---|---|
| « TYPOGRAPHY SYSTEM », « Design is intelligence made visible. », paragraphe anglais, « Primary Action / Secondary » | Nom de ton entreprise en titre (police de titre), slogan en sous-titre, un court paragraphe en français décrivant ton secteur (police de texte), boutons « Nous contacter / En savoir plus » |
| Texte courant bleu-vert (`secondary`) | Gris de texte (`on-surface-variant`) |
| « Choissez votre Police » | « Choisissez vos polices » |
| Noms « Elegant Editorial », « Modern Corporate »… ; « Your Brand Voice » ; « H: / B: » | Noms français (« Éditorial », « Entreprise », « Minimal », « Classique », « Affirmé ») ; exemple « Le texte de votre marque » ; « Titres : … / Texte : … » |
| Pastilles macOS, halo, dégradé carte IA | Cadre plat « Aperçu » |
| Bouton flottant « Importez votre logo » | Bouton « Continuer » standard, dans le flux, bas de colonne droite |
| Radios Material | Icône Lucide `CircleCheck` / cercle vide |
| Erreur rouge Tailwind | Jeton `error` |

### `/Logo`

| Avant | Après |
|---|---|
| Trois titres : « Logo de votre marque », « Création de Logo », « Aperçu en direct » + deux introductions | Un titre « Logo » dans la page, une seule phrase d'intro ; le composant ne porte plus que des sous-titres de cartes (« Importer », « Générer avec l'IA ») |
| Carte de visite penchée avec fusée et barres grises | Carte de visite droite et plate, avec le logo importé à gauche et le **nom + slogan + secteur** de ton entreprise en texte réel (voir décision 2 pour l'inclinaison) |
| Fusée Material en repli | Initiale du nom de l'entreprise dans un carré plat |
| Zone de dépôt : bouton imbriqué, pas de clavier | Zone de dépôt = un seul bouton accessible (Entrée/Espace ouvrent le sélecteur), libellé « Glissez votre logo ici ou cliquez pour choisir un fichier » |
| Accepte tout, SVG recommandé | Accepte **PNG, JPG, WebP, 5 Mo max** ; message d'erreur clair si refusé (côté client seulement ; le contrôle côté serveur est hors de mon périmètre) ; texte « PNG ou JPG avec fond transparent, au moins 512 × 512 px » |
| Message qui tutoie | « Entreprise introuvable. Recommencez depuis la création d'entreprise. » |
| Bouton flottant « Terminer l'identité visuelle » | Bouton standard « Enregistrer l'identité visuelle » dans le flux, avec état de chargement (spinner) et désactivé lisible |
| Icônes Material (nuage, étincelle, coche) | Lucide (`Upload`, `Sparkles`, `Check`) |
| Halo flou sur la carte IA | Fond plat |
| Texte courant bleu-vert, erreur rouge Tailwind | `on-surface-variant`, jeton `error` |

### `/IdentiteVisuelle`

| Avant | Après |
|---|---|
| Stepper avec « Vue d'ensemble » en étape 1 | Plus de stepper sur cette page (c'est un récapitulatif) : voir décision 3 |
| Trois cartes identiques avec pastilles d'icônes colorées | Mêmes trois sections mais sans pastilles ; la section **manquante** est mise en avant (bordure pointillée + bouton « Ajouter ») et les sections remplies sont en retrait ; la palette, plus visuelle, occupe plus de largeur |
| « Titres — non défini » | « Titres : à choisir » / « Texte : à choisir » |
| Message d'erreur brut de la base | Message générique « Impossible de charger l'identité visuelle. Réessayez. » |

### Stepper (`BrandProgessStepper.tsx`)

| Avant | Après |
|---|---|
| « Vue d'ensemble → Palette → Typographie → Logo » | « Entreprise → Palette → Typographie → Logo », identique à la liste de la page de création d'entreprise ; l'étape « Entreprise » affichée comme terminée |
| Bordure des ronds en gris codé en dur | Jeton de couleur du thème |

### Ce que je ne touche PAS

- La **logique de sauvegarde** : brouillons en mémoire locale entre Palette → Typographie → Logo, envoi final à l'API, préremplissage depuis la base.
- Les **hooks** (`useEntrepriseId`, `useIdentiteVisuelle`, `useEntreprise`) et le dossier `src/data/`. J'ajoute seulement un appel à `useEntreprise` dans les trois constructeurs pour lire nom / slogan / secteur.
- Les **palettes et paires de polices** elles-mêmes (valeurs hexadécimales, polices chargées) : uniquement leurs libellés, sauf décision 1.
- Les **animations courtes existantes** : transition de couleur de l'aperçu quand on change de palette, mouvement du bouton standard, remplissage de la barre du stepper.
- Le composant **ChatComposer** et son badge « Bientôt » : déjà conformes.
- La barre latérale, le TopNav, les pages d'authentification, le tableau de bord.

---

## 3. Ce qui demande ta décision

1. **Les palettes.** Garder les 4 actuelles (indigo, noir, ambre, vert, toutes nommées à l'anglo-saxonne) en traduisant juste les noms ? Ou les remplacer par 4 à 6 palettes nommées en français et pensées pour les secteurs fréquents ici (par exemple « Terre et or » pour l'agroalimentaire, « Bleu confiance » pour les services et la finance, « Vert marché » pour le commerce, « Charbon » pour le BTP) ? Le remplacement change les valeurs de couleurs : les entreprises qui ont déjà enregistré une palette ne seraient plus préremplies au retour sur la page.
2. **La carte de visite inclinée sur /Logo.** La supprimer au profit d'un aperçu droit et plat (mon choix par défaut), ou garder l'inclinaison avec le redressement au survol comme « petit mouvement qui a un sens » ?
3. **« Vue d'ensemble » dans le stepper.** Retirer le stepper de la page d'ensemble et le remplacer par « Entreprise » dans les trois pages de création (mon choix par défaut), ou garder « Vue d'ensemble » comme étape 1 partout ? Dans ce dernier cas, le parcours resterait différent de celui annoncé sur la page de création d'entreprise.

---

## Estimation

- **Fichiers touchés : 9** : `PaletteBuilder.tsx`, `police.tsx`, `LogoBuilder.tsx`, `VueEnsemble.tsx`, `BrandProgessStepper.tsx`, et les quatre `page.tsx` (`PaletteColor`, `Typographie`, `Logo`, `IdentiteVisuelle`).
- **Effort : moyen.** Beaucoup de lignes mais aucune logique nouvelle : textes, structure JSX, classes. Le point le plus délicat est la zone de dépôt accessible du logo (clavier + contrôle type/taille), environ une heure à elle seule. Le reste est mécanique et vérifiable page par page dans le navigateur, à 375 px et sur bureau.
