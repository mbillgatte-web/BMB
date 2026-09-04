import fs from "fs";
import path from "path";

const BASE_DIR = path.join(process.cwd(), "public", "visuels");
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif|avif)$/i;

/**
 * Parcourt public/visuels/<categorie>/ pour chaque catégorie donnée et
 * renvoie les chemins publics (/visuels/<categorie>/<fichier>) des images
 * trouvées, triés par nom de fichier.
 *
 * Utilise `fs` (Node) : à appeler UNIQUEMENT depuis un Server Component
 * (voir src/app/Visuels/page.tsx) -- `fs` n'existe pas côté navigateur,
 * donc ce module ne doit jamais être importé par un composant "use client".
 */
export function getVisuelsByCategory(
  categoryIds: string[]
): Record<string, string[]> {
  const result: Record<string, string[]> = {};

  for (const categoryId of categoryIds) {
    const dir = path.join(BASE_DIR, categoryId);

    if (!fs.existsSync(dir)) {
      result[categoryId] = [];
      continue;
    }

    result[categoryId] = fs
      .readdirSync(dir)
      .filter((file) => IMAGE_EXTENSIONS.test(file))
      .sort()
      .map((file) => `/visuels/${categoryId}/${file}`);
  }

  return result;
}
