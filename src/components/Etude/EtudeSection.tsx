"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, WarningCircle } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase/browser";
import { type Projet, getProjet } from "@/data/projet";
import { type EtudeFaisabilite, getEtudeDuProjet } from "@/data/etudeFaisabilite";
import EtudeFaisabiliteForm from "./EtudeFaisabiliteForm";

const LIEN_RETOUR =
  "inline-flex items-center gap-1.5 text-[14px] font-medium text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md";

/**
 * Charge le projet puis son étude (côté client, avec le client navigateur,
 * comme ProjetsSection), et confie le questionnaire à EtudeFaisabiliteForm.
 * Le projet est lu par son id : la RLS renvoie null s'il n'est pas au
 * compte connecté, ce qu'on affiche comme « introuvable ».
 */
export default function EtudeSection({ projetId }: { projetId: string }) {
  const [projet, setProjet] = useState<Projet | null>(null);
  const [etude, setEtude] = useState<EtudeFaisabilite | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const p = await getProjet(supabase, projetId);
        if (annule) return;
        setProjet(p);
        // Pas d'étude à chercher si le projet lui-même est introuvable.
        if (p) setEtude(await getEtudeDuProjet(supabase, p.id));
      } catch (err) {
        if (!annule) setErreur((err as Error).message);
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [projetId]);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/Projets" className={LIEN_RETOUR}>
        <ArrowLeft size={16} weight="bold" aria-hidden="true" />
        Retour aux projets
      </Link>

      {chargement ? (
        <div className="space-y-4" aria-busy="true" aria-label="Chargement">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-surface-container-low" />
          <div className="h-1 animate-pulse rounded-full bg-surface-container-low" />
          <div className="h-[360px] animate-pulse rounded-2xl border border-outline-variant bg-surface-container-low" />
        </div>
      ) : erreur ? (
        <Probleme titre="Impossible de charger l'étude" detail={erreur} />
      ) : !projet ? (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 sm:p-8">
          <p className="text-[16px] font-bold text-on-surface">Projet introuvable</p>
          <p className="mt-1 max-w-[52ch] text-[15px] leading-6 text-on-surface">
            Ce projet n&apos;existe pas, ou n&apos;appartient pas à votre compte.
          </p>
        </div>
      ) : (
        // key : si on change de projet sans quitter la page, le formulaire
        // repart de zéro avec les nouvelles réponses.
        <EtudeFaisabiliteForm key={projet.id} projet={projet} etude={etude} />
      )}
    </div>
  );
}

/** Même bloc d'erreur que ProjetsSection : message clair + détail technique. */
function Probleme({ titre, detail }: { titre: string; detail: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-error/20 bg-error-container/30 p-5 sm:flex-row sm:items-start sm:gap-4"
    >
      <WarningCircle size={24} weight="duotone" className="shrink-0 text-error" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-on-surface">{titre}</p>
        <p className="mt-1 break-words font-mono text-[13px] leading-5 text-on-error-container">{detail}</p>
      </div>
    </div>
  );
}
