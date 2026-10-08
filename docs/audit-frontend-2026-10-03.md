# Audit frontend du 3 octobre 2026 : traces d'IA et sécurité

Rapport de l'agent design-ui (lecture seule). Chemins relatifs à la racine du projet.

## Constat transversal

Toutes les pages connectées s'affichent sans session (`/dashboard`, `/Projets`, `/Templates`, `/PaletteColor`, `/Logo`, `/Visuels`). `src/proxy.ts` ne gère que les sous-domaines ; rien ne redirige vers `/`. Résultat : coque complète + erreurs techniques « Vous devez être connecté » en rouge monospace.

## 1. Coque commune (Sidebar, TopNav, pages)

- `EntrepriseSwitcher.tsx:61` : sous-titre « Strategic Suite » factice quand pas de secteur.
- `SidebarContent.tsx:331-333` : encart Pro avec promesses inventées (« IA illimitée, exports, projets illimités »).
- `TopNav.tsx:52-54` : cloche avec point rouge permanent sans source ; `TopNav.tsx:15` repli « Dashboard » (anglais) pour les pages hors nav.
- `nav-items.ts:56` : icône Sparkle pour « Logo ».
- Trois familles d'icônes (Phosphor, Lucide, Material Symbols via `<link>` Google dans `layout.tsx:85-88`, CSS `globals.css:122-137`).
- Fonds de page différents selon la route (`bg-canvas`, `bg-[#F9FAFB]`, `bg-[#F6F4EF]`).
- Fichiers morts avec patterns IA : `AIRecommendation.tsx` (« +45 % » inventé), `HeroSection.tsx`, `ActiveProjectsKpi.tsx`, `BrandIdentityShowcase.tsx`. Aucun n'est importé.

## 2. Connexion et inscription (validés, pour information)

- `AuthLayout.tsx:154-166` : « Votre idée. / Notre plateforme. / Votre succès. » et citation sans auteur.
- Placeholder téléphone différent entre `Inscription.tsx:196` et `EntrepriseForm.tsx:145`.

## 3. Tableau de bord (validé, pour information)

- `HeroWelcomeText.tsx:30` : mot tournant avec fautes (« votre visuels »), casse incohérente.
- `HeroFluidBackground.tsx` : boucle d'animation permanente décorative.
- `IdentityKpis.tsx:24` : verre dépoli + lift ; `:169` couleurs de repli lavande.
- `DashboardNextSteps.tsx:54-65` : « 0 % complété » + barre pour 4 cases ; phrases génériques.

## 4. Projets et étude

- `ProjetsSection.tsx:321`, `EtudeSection.tsx:87`, `EtudeFaisabiliteForm.tsx:172` : messages Supabase bruts affichés.
- `ProjetsSection.tsx:215-217` : icône dans carré en tête de l'état vide.
- `ProjetForm.tsx:197-205` : textarea sans `maxLength`.
- `EtudeFaisabiliteForm.tsx:249-251` : « Générer l'étude » désactivé sans SoonBadge ; `:262` texte ambigu.
- `useEntrepriseId.ts:74/83`, `LogoBuilder.tsx:103` : messages qui tutoient.

## 5. Site web (/Templates)

- Deux titres empilés (`SiteWebSection.tsx:52-57` + `TemplateGallery.tsx:529-536`).
- Anglicisme « template » partout ; catégories et noms anglais dans `templates-data.ts`.
- 7 entrées sur 12 « Bientôt disponible » avec vignette `placehold.co` externe, bouton Prévisualiser actif.
- `window.confirm` natif (`TemplateGallery.tsx:287`, `SiteChatBuilder.tsx:179`).
- Couleurs Tailwind brutes `red-*`/`green-*` (`TemplateGallery.tsx:505,540,611`, `PublicationSite.tsx:167,200,225,245,262`).
- « Logo détecté », tirets longs comme valeur vide (`:433-434, :445`).
- `SiteChatBuilder.tsx` : pastille « en ligne » factice (`:223`), « En train d'écrire… », « Bonjour ! », pastilles macOS (`:346-350`), `animate-ping` (`:439`), deux blocs `min-h-[580px]` empilés à 375 px (`:216`).
- `ChatComposer.tsx:255-292` : exemples animés même quand désactivé ; `:177-181` ombre verte animée.

## 6. Identité visuelle (Palette, Typographie, Logo)

Ensemble le plus « généré ».
- Textes anglais à l'écran : `PaletteBuilder.tsx:181,207,213-214,224,233,239,254,265,275,360,367`, noms `:26-50` ; `police.tsx:200,210,216,222-225,232,238,333,336-337`, noms `:36-72`.
- L'aperçu est une page SaaS fictive, pas l'entreprise de l'utilisateur : afficher `entreprise.nom`, slogan, secteur.
- Dégradés/halos : `PaletteBuilder.tsx:198-201, 323-324`, `police.tsx:197, 258-259`, `LogoBuilder.tsx:231, 340`.
- Étincelles Material `auto_awesome` : `PaletteBuilder:326`, `police:262`, `LogoBuilder:346` ; `rocket_launch` `LogoBuilder:428`.
- Bouton collant « Continuez vers… » (`PaletteBuilder:396-408`, `police:394-406`, `LogoBuilder:386-398`) recouvre les cartes.
- `PaletteBuilder.tsx:354-383` édition manuelle inopérante (`console.log` `:457-466`) sans SoonBadge ; classe `canvas-shadow` inexistante.
- Titres doublés (`Logo/page.tsx:18-24` + `LogoBuilder.tsx:195-201`).
- Deux steppers contradictoires (`BrandProgessStepper.tsx:8` vs `BuildEntreprisepage.tsx:11-16`).
- Texte courant en `text-secondary`.
- `police.tsx:250` « Choissez » (faute).
- `LogoBuilder.tsx:276-326` zone de dépôt sans clavier, bouton imbriqué ; `:72` accepte SVG sans limite.
- `VueEnsemble.tsx:84,136,192` trois cartes identiques de couleurs différentes.

## 7. Visuels marketing

- `PortfolioGallery.tsx` : hero de site vitrine, galerie 3D hors cadre, marquee avec 74 images.
- `VisualGenerator.tsx:392-398, 329-357` cibles < 44 px ; `:405-414` état vide qui tutoie et montre un chemin de code ; `:417-471` modale sans rôle ni Échap ; `:296` extension de fichier fausse.

## 8. Création d'entreprise

Propre. Slogan `required` à rendre facultatif ; pas de `maxLength` ; téléphone sans `pattern`.

## Sécurité (visible côté client)

1. HAUTE : `/s/[slug]` (`route.ts:43-54`) sert le HTML IA sur l'origine de la plateforme sans sandbox. Un script peut lire le localStorage (session Supabase) de tout visiteur connecté. Correction : `Content-Security-Policy: sandbox allow-scripts allow-forms allow-popups`, puis sous-domaine.
2. HAUTE : aucune garde d'authentification dans `proxy.ts`. RLS protège les données, mais chaque page tente ses requêtes.
3. MOYENNE : session Supabase en localStorage (`lib/supabase/browser.ts:11`). Passer à `@supabase/ssr` + cookies httpOnly.
4. MOYENNE : SSRF, `generate-visual/route.ts:155-165` fetch toute `logoUrl` ; `edit-site:111-116`, `generate-site:91` injectent `imageUrl`. Liste blanche sur l'URL du bucket Supabase.
5. MOYENNE : uploads sans contrôle de type/taille (`site.ts:176`, `identiteVisuelle.ts:100`, `LogoBuilder.tsx:72` SVG).
6. MOYENNE : messages d'erreur internes renvoyés au navigateur (toutes les routes `{ error: err.message }`).
7. BASSE : clé Gemini en query string `?key=` (`lib/gemini.ts:47`, `edit-site:130`) → en-tête `x-goog-api-key`.
8. BASSE : `entrepriseId` d'URL non vérifié (RLS bloque) ; `api/entreprise/route.ts:13` fait confiance au `compteId` client.
9. BASSE : `allow-popups-to-escape-sandbox` dans l'aperçu IA (`SiteChatBuilder.tsx:49`, `site-preview/route.ts:14`).
10. BASSE : pas de limites de longueur sur prompts et champs.
11. OK : `rel="noopener noreferrer"` partout.

## Top 8

1. CSP sandbox sur `/s/[slug]` + retrait `allow-popups-to-escape-sandbox` (petit).
2. Garde d'authentification + messages d'erreur génériques (moyen).
3. SSRF + liste blanche uploads (petit).
4. Pages Palette/Typographie/Logo : français, vraie entreprise, fonds plats, bouton dans le flux, SoonBadge, un seul stepper (moyen).
5. Visuels : supprimer PortfolioGallery, cibles 44 px, modale accessible (moyen).
6. Une seule famille d'icônes, retrait Material (moyen).
7. Templates : un titre, « modèle », masquer les « bientôt », confirmation intégrée, jetons error (moyen).
8. Sidebar/TopNav : retirer l'argumentaire Pro, « Strategic Suite », point rouge ; supprimer les composants morts (petit).
