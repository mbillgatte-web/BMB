// Captures d'écran pour le guide d'utilisation du rapport.
//
// Se connecte avec le compte de test (tests/fixtures/compte-test.json) sur le
// serveur de développement, puis photographie les écrans listés dans PAGES
// en 1280x800, résolution doublée. Résultats dans docs/rapport/captures/.
//
// Prérequis : `npm run dev` lancé, Google Chrome installé.
// Lancer : node scripts/captures-guide.mjs
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const SORTIE = path.resolve("docs/rapport/captures");
const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
].find((p) => fs.existsSync(p));

const compte = JSON.parse(fs.readFileSync("tests/fixtures/compte-test.json", "utf8"));

const PAGES = [
  { fichier: "guide-1-tableau-de-bord.png", url: "/dashboard" },
  { fichier: "guide-2-creation-entreprise.png", url: "/BuildEntreprise" },
  { fichier: "guide-3-palette-couleurs.png", url: "/PaletteColor" },
  { fichier: "guide-4-site-web.png", url: "/Templates" },
];

if (!CHROME) throw new Error("Google Chrome introuvable.");
fs.mkdirSync(SORTIE, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1280, height: 800, deviceScaleFactor: 2 },
});
const page = await browser.newPage();

// Connexion par le formulaire, comme un utilisateur.
await page.goto(`${BASE}/`, { waitUntil: "networkidle2" });
await page.type('input[type="email"]', compte.email);
await page.type('input[type="password"]', compte.password);
await Promise.all([
  page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
  page.click('button[type="submit"]'),
]);
if (!page.url().includes("/dashboard")) {
  throw new Error(`Connexion échouée, page actuelle : ${page.url()}`);
}

for (const { fichier, url } of PAGES) {
  await page.goto(`${BASE}${url}`, { waitUntil: "networkidle2" });
  // Laisse finir les animations d'entrée et le chargement des données.
  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(SORTIE, fichier) });
  console.log("capturé :", fichier);
}

await browser.close();
