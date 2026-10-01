"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, ExternalLink, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase/browser";
import { getSite } from "@/data/site";

type Props = {
  entrepriseId: string | null | undefined;
  templateId: string;
  /**
   * Change quand le brouillon vient d'être modifié (édition IA, réinitialisation) :
   * sert à recharger l'état de publication sans recharger la page.
   */
  refreshToken?: number;
  /** Faux tant que le site n'a rien à publier (ex. site IA pas encore généré). */
  publiable?: boolean;
  /** `compact` : une seule ligne, pour la barre d'aperçu du chat IA. */
  variante?: "carte" | "compact";
  className?: string;
};

type Etat = {
  slug: string | null;
  estPublie: boolean;
  publieLe: string | null;
};

const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed";
const BTN_PLEIN = `${BTN} bg-primary text-white hover:bg-primary-hover disabled:bg-surface-container-high disabled:text-on-surface-variant`;
const BTN_CONTOUR = `${BTN} border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-60`;

function formaterDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });
}

/**
 * Bloc « Publication » d'un site : état (non publié / publié le …), bouton
 * Publier ou Republier, Dépublier, et l'adresse publique avec Copier et
 * Ouvrir. Utilisé dans la vue d'édition d'un modèle (TemplateGallery) et dans
 * le chat IA (SiteChatBuilder). Parle aux routes /api/site/publier et
 * /api/site/depublier ; lit l'état via getSite (RLS : seul le propriétaire
 * voit son site).
 */
export default function PublicationSite({
  entrepriseId,
  templateId,
  refreshToken = 0,
  publiable = true,
  variante = "carte",
  className,
}: Props) {
  const [etat, setEtat] = useState<Etat | null>(null);
  const [action, setAction] = useState<"publier" | "depublier" | null>(null);
  const [erreur, setErreur] = useState("");
  const [copie, setCopie] = useState(false);

  const charger = useCallback(async () => {
    if (!entrepriseId) return;
    const site = await getSite(supabase, entrepriseId, templateId).catch(() => null);
    setEtat(
      site
        ? { slug: site.slug, estPublie: site.est_publie, publieLe: site.publie_le }
        : { slug: null, estPublie: false, publieLe: null }
    );
  }, [entrepriseId, templateId]);

  // Recharge l'état au montage et à chaque changement de refreshToken (qui
  // n'est pas lu : il sert seulement à relancer l'effet). Même schéma que
  // SiteChatBuilder : l'écriture d'état arrive après la réponse réseau.
  useEffect(() => {
    void refreshToken;
    if (!entrepriseId) return;
    let annule = false;
    getSite(supabase, entrepriseId, templateId)
      .catch(() => null)
      .then((site) => {
        if (annule) return;
        setEtat(
          site
            ? { slug: site.slug, estPublie: site.est_publie, publieLe: site.publie_le }
            : { slug: null, estPublie: false, publieLe: null }
        );
      });
    return () => {
      annule = true;
    };
  }, [entrepriseId, templateId, refreshToken]);

  const url =
    etat?.slug && typeof window !== "undefined" ? `${window.location.origin}/s/${etat.slug}` : null;

  const appeler = async (quoi: "publier" | "depublier") => {
    if (!entrepriseId) return;
    setAction(quoi);
    setErreur("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setAction(null);
      setErreur("Vous devez être connecté.");
      return;
    }

    try {
      const res = await fetch(`/api/site/${quoi}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ entrepriseId, templateId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErreur(data.error ?? "Échec de l'opération.");
        return;
      }
      await charger();
    } catch {
      setErreur("Impossible de contacter le serveur. Réessayez.");
    } finally {
      setAction(null);
    }
  };

  const copier = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 1800);
    } catch {
      setErreur("Copie impossible : sélectionnez l'adresse à la main.");
    }
  };

  const occupe = action !== null;
  const publie = Boolean(etat?.estPublie && url);

  const boutons = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => appeler("publier")}
        disabled={occupe || !publiable || !entrepriseId}
        title={publiable ? undefined : "Rien à publier pour l'instant"}
        className={BTN_PLEIN}
      >
        {action === "publier" ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Globe className="h-4 w-4" aria-hidden="true" />
        )}
        {action === "publier" ? "Publication…" : publie ? "Republier" : "Publier"}
      </button>
      {publie && (
        <button
          type="button"
          onClick={() => appeler("depublier")}
          disabled={occupe}
          className={cn(BTN_CONTOUR, "hover:border-red-300 hover:bg-red-50 hover:text-red-700")}
        >
          {action === "depublier" ? "Retrait…" : "Dépublier"}
        </button>
      )}
    </div>
  );

  const adresse = (
    <AnimatePresence initial={false}>
      {publie && url && (
        <motion.div
          key="adresse"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface-container-low pl-3 pr-1"
        >
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate py-2 text-[13.5px] font-medium text-on-surface hover:text-primary"
          >
            {url.replace(/^https?:\/\//, "")}
          </a>
          <button
            type="button"
            onClick={copier}
            title="Copier l'adresse"
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
              copie ? "text-green-700" : "text-on-surface-variant hover:bg-primary/10 hover:text-primary"
            )}
          >
            {copie ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            <span className="sr-only">{copie ? "Adresse copiée" : "Copier l'adresse"}</span>
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Ouvrir le site"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Ouvrir le site</span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const statut = (
    <p className="flex items-center gap-2 text-[13.5px] text-on-surface">
      <span
        aria-hidden="true"
        className={cn("h-2 w-2 shrink-0 rounded-full", publie ? "bg-green-600" : "bg-outline")}
      />
      {!entrepriseId
        ? "Sélectionnez une entreprise pour publier."
        : etat === null
          ? "Chargement…"
          : publie && etat.publieLe
          ? `Publié le ${formaterDate(etat.publieLe)}`
          : "Non publié : visible uniquement par vous."}
    </p>
  );

  if (variante === "compact") {
    return (
      <div className={cn("flex flex-col gap-2 border-b border-outline-variant px-4 py-3", className)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {statut}
          {boutons}
        </div>
        {adresse}
        {erreur && <p className="text-[13px] text-red-700">{erreur}</p>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm",
        className
      )}
    >
      <h3 className="text-[15px] font-bold text-on-surface">Publication</h3>
      {statut}
      {adresse}
      {boutons}
      {erreur && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-800">{erreur}</p>
      )}
      <p className="text-[12.5px] leading-5 text-on-surface-variant">
        La version publiée est figée : vos visiteurs ne voient pas vos modifications tant que vous ne
        republiez pas.
      </p>
    </div>
  );
}
