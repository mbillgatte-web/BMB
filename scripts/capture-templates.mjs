/**
 * Génère la vignette (preview.png) de chaque template opérationnel de la
 * galerie « Mon site web », en capturant le vrai rendu de
 * /api/site-preview/<templateId> avec Chrome ou Edge en mode sans fenêtre.
 *
 * Usage : npm run templates:capture   (le serveur de dev doit tourner ;
 *         BASE_URL pour changer l'adresse, par défaut http://localhost:3000)
 *
 * À relancer quand un template change d'apparence : la vignette est un
 * fichier statique servi depuis public/Templates/<id>/preview.png (voir
 * thumbnailUrl dans TemplateGallery.tsx).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const ROOT = process.cwd();

const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
];
const browser = process.env.BROWSER ?? BROWSERS.find((p) => existsSync(p));
if (!browser) {
  console.error("Aucun navigateur Chrome/Edge trouvé. Indiquez-le avec BROWSER=<chemin>.");
  process.exit(1);
}

// templates-data.ts est du TypeScript : on en extrait juste les templateId
// par regex plutôt que de l'importer (pas de loader TS ici).
const source = readFileSync(path.join(ROOT, "src/components/Templates/templates-data.ts"), "utf8");
const ids = [...source.matchAll(/templateId:\s*"([\w-]+)"/g)].map((m) => m[1]);

for (const id of ids) {
  const out = path.join(ROOT, "public", "Templates", id, "preview.png");
  const url = `${BASE_URL}/api/site-preview/${id}`;
  process.stdout.write(`${id} ... `);
  execFileSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1280,800",
    // Rendu à 1280 px de large mais image réduite (960x600) : assez nette
    // pour une vignette de galerie, ~2x plus légère qu'un PNG plein format.
    "--force-device-scale-factor=0.75",
    "--virtual-time-budget=8000",
    `--screenshot=${out}`,
    url,
  ], { stdio: ["ignore", "ignore", "inherit"] });
  console.log("ok");
}
