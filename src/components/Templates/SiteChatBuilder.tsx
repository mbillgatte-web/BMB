"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Monitor, RotateCcw, Smartphone, Sparkles, X } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";
import {
  SITE_IA_ID,
  getSite,
  messagesDuSiteIA,
  uploaderImageSite,
  type MessageSiteIA,
} from "@/data/site";
import ChatComposer, { type Raccourci } from "./ChatComposer";
import PublicationSite from "./PublicationSite";

const SUGGESTIONS = [
  "Un site vitrine qui présente mes services, mes horaires et un bouton pour me contacter sur WhatsApp",
  "Une page d'accueil moderne avec une section « À propos », mes services et un formulaire de contact",
  "Un site élégant et aéré qui met en valeur mes produits",
];

// Exemples qui défilent dans la zone de saisie vide.
const EXEMPLES_CREATION = [
  "Un site vitrine pour mon activité…",
  "Une page élégante et épurée…",
  "Un site avec un bouton WhatsApp…",
  "Mes produits bien mis en valeur…",
];
const EXEMPLES_MODIFICATION = [
  "Passe le site en rouge et noir…",
  "Ajoute une galerie photos…",
  "Raccourcis le titre principal…",
  "Ajoute mes horaires…",
];

// Pastilles qui pré-remplissent une demande de modification.
const RACCOURCIS: Raccourci[] = [
  { libelle: "Changer les couleurs", texte: "Change les couleurs du site : " },
  { libelle: "Ajouter une section", texte: "Ajoute une section " },
  { libelle: "Réécrire les textes", texte: "Réécris les textes pour qu'ils soient " },
  { libelle: "Adapter au mobile", texte: "Améliore l'affichage sur téléphone : " },
];

// Le HTML vient d'une IA : iframe isolée (origine opaque), ses scripts
// tournent mais ne peuvent pas lire la session de la plateforme.
const SANDBOX = "allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox";

/**
 * Création d'un site par conversation avec l'IA, sans passer par un
 * template : chat à gauche, aperçu en direct à droite (voir
 * /api/generate-site pour la génération).
 */
export default function SiteChatBuilder() {
  const { entreprise, loading: loadingEntreprise } = useEntreprise();

  const [messages, setMessages] = useState<MessageSiteIA[]>([]);
  const [html, setHtml] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [saisie, setSaisie] = useState("");
  const [image, setImage] = useState<{ url: string; nom: string } | null>(null);
  const [envoiImage, setEnvoiImage] = useState(false);
  const [appareil, setAppareil] = useState<"ordinateur" | "mobile">("ordinateur");
  const [pleinEcran, setPleinEcran] = useState(false);
  // Dernière demande envoyée, pour pouvoir la relancer après une erreur.
  const [derniereDemande, setDerniereDemande] = useState<{ texte: string; recommencer: boolean } | null>(null);
  // Après « Recommencer », le prochain message crée un nouveau site.
  const [modeRecommencer, setModeRecommencer] = useState(false);

  const finDuFilRef = useRef<HTMLDivElement>(null);

  const rechargerSite = useCallback(async (entrepriseId: string) => {
    const site = await getSite(supabase, entrepriseId, SITE_IA_ID).catch(() => null);
    setMessages(messagesDuSiteIA(site));
    setHtml(site?.html ?? null);
    setChargement(false);
  }, []);

  // Reprend la conversation et le site déjà créés pour cette entreprise.
  useEffect(() => {
    if (!entreprise) return;
    let annule = false;
    getSite(supabase, entreprise.id, SITE_IA_ID)
      .catch(() => null)
      .then((site) => {
        if (annule) return;
        setMessages(messagesDuSiteIA(site));
        setHtml(site?.html ?? null);
        setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [entreprise]);

  // Garde le dernier message visible.
  useEffect(() => {
    finDuFilRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, envoi, erreur]);

  // Plein écran : Échap pour fermer.
  useEffect(() => {
    if (!pleinEcran) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setPleinEcran(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [pleinEcran]);

  const envoyer = async (texte: string, recommencer = false) => {
    const demande = texte.trim();
    if (!demande || !entreprise || envoi) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setErreur("Vous devez être connecté.");
      return;
    }

    const imageJointe = image;
    setErreur("");
    setEnvoi(true);
    setSaisie("");
    setImage(null);
    setDerniereDemande({ texte: demande, recommencer });
    // Affiche tout de suite la demande dans le fil.
    setMessages((m) => [
      ...(recommencer ? [] : m),
      { role: "user", text: demande, ...(imageJointe ? { imageUrl: imageJointe.url } : {}) },
    ]);

    const res = await fetch("/api/generate-site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        entrepriseId: entreprise.id,
        prompt: demande,
        imageUrl: imageJointe?.url ?? null,
        recommencer,
      }),
    });
    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      setEnvoi(false);
      setErreur(body.error ?? "La création du site a échoué. Réessayez.");
      // Le fil revient à son état enregistré (sans la demande échouée).
      await rechargerSite(entreprise.id);
      return;
    }

    await rechargerSite(entreprise.id);
    setEnvoi(false);
  };

  const epinglerImage = async (fichier: File) => {
    if (!entreprise) return;
    setEnvoiImage(true);
    setErreur("");
    try {
      const url = await uploaderImageSite(supabase, entreprise.id, fichier);
      setImage({ url, nom: fichier.name });
    } catch (err) {
      setErreur(`Échec de l'envoi de l'image : ${(err as Error).message}`);
    } finally {
      setEnvoiImage(false);
    }
  };

  const recommencer = () => {
    if (!window.confirm("Repartir de zéro ? Le site actuel et la conversation seront remplacés au prochain message.")) {
      return;
    }
    setMessages([]);
    setHtml(null);
    setDerniereDemande(null);
    setErreur("");
    setModeRecommencer(true);
  };

  const soumettre = () => {
    const aRecommencer = modeRecommencer;
    setModeRecommencer(false);
    envoyer(saisie, aRecommencer);
  };

  if (!loadingEntreprise && !entreprise) {
    return (
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-xl text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Créez ou sélectionnez d&apos;abord une entreprise : l&apos;assistant s&apos;appuie sur ses informations et
          son identité visuelle pour construire le site.
        </p>
      </div>
    );
  }

  const apercu = (
    <iframe
      srcDoc={html ?? undefined}
      sandbox={SANDBOX}
      title={`Aperçu du site de ${entreprise?.nom ?? "votre entreprise"}`}
      className="h-full w-full border-0 bg-white"
    />
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(360px,440px)_minmax(0,1fr)]">
      {/* --- Conversation --- */}
      <section className="flex h-[calc(100dvh-260px)] min-h-[580px] flex-col overflow-hidden rounded-[28px] border border-outline-variant/70 bg-surface-container-low shadow-[0_12px_40px_-24px_rgba(35,37,120,0.35)]">
        <header className="flex items-center gap-3 bg-surface-container-lowest/80 px-5 py-4">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-[0_8px_18px_-8px_rgba(70,72,212,0.8)]">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            {/* Pastille « en ligne » */}
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-container-lowest bg-[#22C55E]" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-on-surface">Assistant site web</p>
            <p className="truncate text-[12.5px] text-on-surface-variant">
              {envoi ? "En train d'écrire…" : entreprise ? `Pour ${entreprise.nom}` : "Chargement…"}
            </p>
          </div>
          {(html || messages.length > 0) && (
            <button
              type="button"
              onClick={recommencer}
              disabled={envoi}
              className="flex items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-[12.5px] font-medium text-on-surface-variant transition-colors hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Recommencer
            </button>
          )}
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
          {chargement ? (
            <div className="space-y-3">
              <div className="h-16 w-3/4 animate-pulse rounded-3xl bg-surface-container" />
              <div className="ml-auto h-10 w-1/2 animate-pulse rounded-3xl bg-surface-container" />
            </div>
          ) : (
            <>
              {/* Message d'accueil, toujours en tête du fil. */}
              <Bulle role="assistant">
                Bonjour ! Décrivez le site que vous voulez pour <strong>{entreprise?.nom}</strong> : vos services,
                les sections souhaitées, l&apos;ambiance… Je le construis avec vos couleurs, vos polices et votre
                logo, puis vous pourrez me demander des changements.
              </Bulle>

              {messages.length === 0 && !envoi && (
                <div className="flex flex-col gap-2 pl-10">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.06 } }}
                      onClick={() => setSaisie(s)}
                      className="rounded-2xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-left text-[13px] text-on-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_20px_-12px_rgba(70,72,212,0.5)]"
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <Bulle key={`${i}-${m.role}`} role={m.role} imageUrl={m.imageUrl}>
                    {m.text}
                  </Bulle>
                ))}
              </AnimatePresence>

              {envoi && (
                <Bulle role="assistant">
                  <span className="flex items-center gap-2.5">
                    <span className="flex gap-1" aria-hidden="true">
                      {[0, 150, 300].map((delai) => (
                        <span
                          key={delai}
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary"
                          style={{ animationDelay: `${delai}ms` }}
                        />
                      ))}
                    </span>
                    {html ? "J'applique vos changements…" : "Je construis votre site… cela peut prendre une minute."}
                  </span>
                </Bulle>
              )}

              {erreur && (
                <div
                  role="alert"
                  className="animate-rise-in ml-10 rounded-2xl border border-error/20 bg-error-container/40 px-3.5 py-3 text-[13px] text-on-error-container"
                >
                  {erreur}
                  {derniereDemande && (
                    <button
                      type="button"
                      onClick={() => envoyer(derniereDemande.texte, derniereDemande.recommencer)}
                      className="ml-2 font-semibold underline underline-offset-2"
                    >
                      Réessayer
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          <div ref={finDuFilRef} />
        </div>

        {/* Zone de saisie flottante */}
        <div className="px-3 pb-3 pt-1">
          <ChatComposer
            value={saisie}
            onChange={setSaisie}
            onSubmit={soumettre}
            disabled={envoi || !entreprise}
            exemples={html ? EXEMPLES_MODIFICATION : EXEMPLES_CREATION}
            raccourcis={html ? RACCOURCIS : []}
            onJoindre={epinglerImage}
            envoiPieceJointe={envoiImage}
            pieceJointe={image}
            onRetirerPieceJointe={() => setImage(null)}
          />
          <p className="mt-2 px-2 text-center text-[11px] text-outline">
            {envoiImage ? "Envoi de l'image…" : "Entrée pour envoyer · Maj + Entrée pour aller à la ligne"}
          </p>
        </div>
      </section>

      {/* --- Aperçu --- */}
      <section className="flex h-[calc(100dvh-260px)] min-h-[580px] flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-3 border-b border-outline-variant px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </span>
          <span className="flex-1 font-label-md text-label-md text-on-surface">Aperçu en direct</span>

          <div className="flex rounded-lg border border-outline-variant p-0.5" role="group" aria-label="Taille de l'aperçu">
            {(
              [
                ["ordinateur", Monitor, "Ordinateur"],
                ["mobile", Smartphone, "Mobile"],
              ] as const
            ).map(([valeur, Icone, libelle]) => (
              <button
                key={valeur}
                type="button"
                onClick={() => setAppareil(valeur)}
                aria-pressed={appareil === valeur}
                title={libelle}
                className={cn(
                  "flex h-7 w-8 items-center justify-center rounded-md transition-colors",
                  appareil === valeur ? "bg-primary/10 text-primary" : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                <Icone className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{libelle}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setPleinEcran(true)}
            disabled={!html}
            title="Plein écran"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Plein écran</span>
          </button>
        </div>

        {/* Mise en ligne du site IA (voir PublicationSite.tsx) : publiable
            seulement une fois qu'un HTML existe. */}
        <PublicationSite
          variante="compact"
          entrepriseId={entreprise?.id}
          templateId={SITE_IA_ID}
          publiable={Boolean(html)}
          refreshToken={html?.length ?? 0}
        />

        <div className="relative flex flex-1 justify-center overflow-hidden bg-surface-container-low">
          {html ? (
            <motion.div
              key={appareil}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={cn(
                "h-full bg-white",
                appareil === "mobile"
                  ? "my-4 h-[calc(100%-2rem)] w-[390px] max-w-full overflow-hidden rounded-[28px] border-[6px] border-inverse-surface shadow-xl"
                  : "w-full"
              )}
            >
              {apercu}
            </motion.div>
          ) : (
            !envoi && (
              <div className="m-6 flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Monitor className="h-6 w-6" aria-hidden="true" />
                </span>
                <p className="mt-4 font-label-md text-label-md text-on-surface">Votre site apparaîtra ici</p>
                <p className="mt-1 max-w-[280px] text-[13px] text-on-surface-variant">
                  Décrivez-le à l&apos;assistant : l&apos;aperçu se met à jour après chaque message.
                </p>
              </div>
            )
          )}

          {/* Voile pendant la génération */}
          <AnimatePresence>
            {envoi && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface-container-lowest/80"
              >
                <span className="relative flex h-12 w-12 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary">
                    <Sparkles className="h-5 w-5" aria-hidden="true" />
                  </span>
                </span>
                <p className="font-label-md text-label-md text-on-surface">
                  {html ? "Mise à jour du site…" : "Création de votre site…"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Plein écran */}
      {pleinEcran && html && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Aperçu en plein écran">
          <div className="flex justify-end pb-2">
            <button
              type="button"
              onClick={() => setPleinEcran(false)}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[13px] font-medium text-on-surface shadow"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Fermer
            </button>
          </div>
          <div className="flex-1 overflow-hidden rounded-xl bg-white">{apercu}</div>
        </div>
      )}
    </div>
  );
}

function Bulle({
  role,
  imageUrl,
  children,
}: {
  role: MessageSiteIA["role"];
  imageUrl?: string;
  children: React.ReactNode;
}) {
  const utilisateur = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn("flex items-end gap-2", utilisateur ? "justify-end" : "justify-start")}
    >
      {!utilisateur && (
        <span className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div
        className={cn(
          "max-w-[85%] whitespace-pre-line rounded-3xl px-4 py-3 text-[14px] leading-relaxed",
          utilisateur
            ? "rounded-br-lg bg-primary text-on-primary shadow-[0_10px_24px_-14px_rgba(70,72,212,0.9)]"
            : "rounded-bl-lg border border-outline-variant/60 bg-surface-container-lowest text-on-surface shadow-[0_6px_18px_-14px_rgba(27,27,35,0.35)]"
        )}
      >
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Image jointe" className="mb-2 max-h-32 rounded-2xl object-cover" />
        )}
        {children}
      </div>
    </motion.div>
  );
}
