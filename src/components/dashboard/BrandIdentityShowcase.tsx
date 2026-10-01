"use client";

import Link from "next/link";
import { ImageIcon } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { FONT_FAMILY_VARS } from "@/components/Identite_visuel/police";

// Une tuile parmi d'autres sur la ligne des KPI du dashboard (voir
// DashboardView.tsx : grille sm:grid-cols-2 lg:grid-cols-4, comme les
// anciennes KpiCards, pour laisser la place à d'autres tuiles KPI sur la
// même ligne). Même source de données que VueEnsemble.tsx (page
// /IdentiteVisuelle) -- et même traitement visuel simple (carte bordée
// standard de l'app, sans effet particulier) après retour en arrière sur
// l'essai précédent (halo décoratif, ombre en couches façon 21st.dev,
// couleur dynamique) qui ne convenait pas.

export default function BrandIdentityShowcase() {
  const { entreprise, loading: loadingEntreprise } = useEntreprise();
  const { identiteVisuelle, loading: loadingIdentite } = useIdentiteVisuelle(
    entreprise?.id ?? null
  );

  const withEntreprise = (link: string) =>
    entreprise ? `${link}?entrepriseId=${entreprise.id}` : link;

  if (loadingEntreprise || loadingIdentite) {
    return (
      <div className="h-[84px] animate-pulse rounded-xl border border-outline-variant bg-surface-container-lowest" />
    );
  }

  if (!entreprise || !identiteVisuelle) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-md text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {entreprise
            ? "Configurez l'identité visuelle de votre entreprise."
            : "Créez votre entreprise pour commencer."}
        </p>
        <Button
          href={entreprise ? withEntreprise("/PaletteColor") : "/BuildEntreprise"}
          variant="ghost"
          size="sm"
        >
          {entreprise ? "Configurer l'identité visuelle" : "Créer mon entreprise"}
        </Button>
      </div>
    );
  }

  const { couleur_primaire, couleur_fond, couleur_accent, police_titre, logo_url } =
    identiteVisuelle;
  const headingFont = police_titre ? FONT_FAMILY_VARS[police_titre] : undefined;

  return (
    <Link
      href={withEntreprise("/IdentiteVisuelle")}
      className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-shadow hover:shadow-md"
    >
      {logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo_url}
          alt={`Logo de ${entreprise.nom}`}
          className="h-12 w-12 shrink-0 rounded-full bg-primary-container/20 object-contain p-1.5"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-primary">
          <ImageIcon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p
          className="truncate font-label-md text-base font-bold text-on-surface"
          style={{ fontFamily: headingFont }}
        >
          {entreprise.nom}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {[couleur_fond, couleur_primaire, couleur_accent]
              .filter((c): c is string => Boolean(c))
              .map((c, i) => (
                <span
                  key={`${c}-${i}`}
                  className="h-4 w-4 rounded-full border border-surface-container-lowest"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
          </div>
          <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
            {police_titre ?? "Identité de marque"}
          </span>
        </div>
      </div>
    </Link>
  );
}
