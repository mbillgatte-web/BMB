import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getSitePublie } from "@/data/site";

// Slug tel que généré par src/data/site.ts (slugifier) : minuscules,
// chiffres, tirets. Tout le reste est refusé avant même d'interroger la base.
const SAFE_SLUG = /^[a-z0-9-]{3,40}$/;

// Page 404 autonome (aucune dépendance au design de la plateforme) : elle est
// vue par les visiteurs d'un entrepreneur, pas par l'entrepreneur lui-même.
const PAGE_404 = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Site introuvable</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f7f7fb;color:#1b1b23;text-align:center;padding:24px}main{max-width:420px}h1{font-size:1.5rem;margin:0 0 8px}p{margin:0;line-height:1.6;color:#55556a}</style></head><body><main><h1>Ce site n'est pas disponible</h1><p>Il n'est pas publié ou n'existe pas. Si vous êtes son propriétaire, publiez-le depuis votre tableau de bord Build My Business.</p></main></body></html>`;

/**
 * GET /s/<slug> — la page PUBLIQUE d'un site publié.
 *
 * Contrairement à /api/site-preview (aperçu privé du brouillon, servi en
 * sandbox pour l'iframe du tableau de bord), on sert ici la copie figée
 * `html_publie` comme une vraie page : sans sandbox, avec cache, indexable.
 * La lecture passe par la fonction SQL `site_publie` (voir la migration
 * supabase/migrations/*_publication_site.sql) avec le client anonyme : aucune
 * policy publique sur la table `site`, et rien n'est révélé si le site n'est
 * pas publié.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!SAFE_SLUG.test(slug)) {
    return reponse404();
  }

  const site = await getSitePublie(createServerSupabase(), slug).catch(() => null);
  if (!site) return reponse404();

  // Le HTML publié est laissé tel quel ; on s'assure seulement que les
  // moteurs de recherche peuvent l'indexer (le brouillon, lui, ne l'est pas).
  const html = /<meta\s+name=["']robots["']/i.test(site.html_publie)
    ? site.html_publie
    : site.html_publie.replace(/<\/head>/i, '<meta name="robots" content="index,follow"></head>');

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Servi depuis le cache CDN 5 min, réutilisé jusqu'à 10 min de plus
      // pendant la revalidation : une republication est visible en quelques
      // minutes, sans recharger la base à chaque visite.
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}

function reponse404() {
  return new NextResponse(PAGE_404, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
