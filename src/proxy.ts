import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sous-domaines des sites publiés : `chez-mama.<domaine racine>` est servi
 * comme `/s/chez-mama` (voir src/app/s/[slug]/route.ts), sans redirection
 * visible pour le visiteur.
 *
 * Le domaine racine vient de NEXT_PUBLIC_DOMAINE_RACINE (ex.
 * « buildmybusiness.com »). Tant que la variable est absente (pas encore de
 * nom de domaine acheté), ce proxy ne fait rien : la plateforme et les sites
 * restent servis par chemin (/s/<slug>) sur l'adresse Vercel.
 *
 * Test en local : NEXT_PUBLIC_DOMAINE_RACINE=localhost:3000 puis ouvrir
 * http://chez-mama.localhost:3000/ (les navigateurs résolvent *.localhost
 * vers la machine sans configuration).
 */
const DOMAINE_RACINE = process.env.NEXT_PUBLIC_DOMAINE_RACINE?.toLowerCase();

// Sous-domaines qui désignent la plateforme elle-même, jamais un site.
const SOUS_DOMAINES_RESERVES = new Set(["www", "app", "api"]);

export function proxy(request: NextRequest) {
  if (!DOMAINE_RACINE) return NextResponse.next();

  const hote = (request.headers.get("host") ?? "").toLowerCase();
  if (!hote.endsWith(`.${DOMAINE_RACINE}`)) return NextResponse.next();

  const slug = hote.slice(0, -(DOMAINE_RACINE.length + 1));
  if (!slug || slug.includes(".") || SOUS_DOMAINES_RESERVES.has(slug)) {
    return NextResponse.next();
  }

  // Seule la page d'accueil du sous-domaine est un site publié ; les assets
  // des modèles (/Templates/...) et les fichiers Next restent servis tels
  // quels grâce au matcher ci-dessous.
  const url = request.nextUrl.clone();
  url.pathname = `/s/${slug}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Exclut les fichiers statiques et les routes internes : ils doivent
  // rester accessibles à l'identique depuis un sous-domaine.
  matcher: ["/((?!_next/|api/|Templates/|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
